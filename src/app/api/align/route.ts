import { NextRequest, NextResponse } from 'next/server';
import { ResumeData, KeywordMatch, SkillCategory } from '@/types/resume';
import { extractJobTitle, analyzeJobKeywords } from '@/utils/keywordEngine';

interface AlignRequestBody {
  jobDescription: string;
  currentResume: ResumeData;
  clientApiKey?: string;
}

interface DiscoveredModel {
  name: string;
  version: string;
}

interface ParsedAlignmentOutput {
  jobTitle: string;
  company: string;
  keywords: Array<{ keyword: string; category: string; matched?: boolean }>;
  tailoredSummary: string;
  recommendedSkills: SkillCategory[];
  rationale: string;
}

/**
 * Queries Google ListModels API on v1beta and v1 to discover all available
 * text generation models for the user's specific API key.
 */
async function discoverModels(apiKey: string): Promise<{ models: DiscoveredModel[]; error?: string }> {
  const versions = ['v1beta', 'v1'];
  const allDiscovered: DiscoveredModel[] = [];
  let apiError: any = null;

  for (const ver of versions) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`);
      const data = await res.json();

      if (data.error) {
        apiError = data.error;
        continue;
      }

      if (Array.isArray(data.models)) {
        for (const m of data.models) {
          const rawName = (m.name || '').replace(/^models\//, '');
          const methods: string[] = m.supportedGenerationMethods || [];

          // Only keep models that support generateContent and are not purely multimodal image/tts/audio
          if (
            methods.includes('generateContent') &&
            !rawName.includes('-tts') &&
            !rawName.includes('-image') &&
            !rawName.includes('lyria') &&
            !rawName.includes('transcribe') &&
            !rawName.includes('robotics')
          ) {
            allDiscovered.push({
              name: rawName,
              version: ver,
            });
          }
        }

        if (allDiscovered.length > 0) {
          break;
        }
      }
    } catch {
      // Continue to next version
    }
  }

  if (allDiscovered.length === 0 && apiError) {
    const rawMsg = apiError.message || JSON.stringify(apiError);
    if (rawMsg.includes('API key not valid')) {
      return { models: [], error: 'API key is invalid. Please verify your Google AI Studio key in AI Settings.' };
    }
    if (rawMsg.includes('Generative Language API has not been used') || rawMsg.includes('disabled')) {
      return {
        models: [],
        error:
          'The Generative Language API is disabled for this key project. Please enable it in Google Cloud Console or create a free key at https://aistudio.google.com/app/apikey.',
      };
    }
    return { models: [], error: `Google API: ${rawMsg}` };
  }

  return { models: allDiscovered };
}

/**
 * Sorts discovered models by preference for fast, high-quality structured ATS alignment.
 */
function rankDiscoveredModels(models: DiscoveredModel[]): DiscoveredModel[] {
  const priorityPatterns = [
    /^gemini-2\.5-flash$/i,
    /^gemini-flash-latest$/i,
    /^gemini-2\.5-flash-lite$/i,
    /^gemini-flash-lite-latest$/i,
    /^gemini-2\.5-pro$/i,
    /^gemini-pro-latest$/i,
    /^gemini-3\.5-flash$/i,
    /^gemini-2\.0-flash$/i,
    /^gemini-1\.5-flash$/i,
    /^gemini-1\.5-pro$/i,
    /^gemini/i,
  ];

  const sorted: DiscoveredModel[] = [];
  const visited = new Set<string>();

  for (const pattern of priorityPatterns) {
    for (const m of models) {
      if (!visited.has(m.name) && pattern.test(m.name)) {
        visited.add(m.name);
        sorted.push(m);
      }
    }
  }

  // Append any remaining models
  for (const m of models) {
    if (!visited.has(m.name)) {
      visited.add(m.name);
      sorted.push(m);
    }
  }

  return sorted;
}

/**
 * Calls Gemini generateContent directly via REST.
 */
async function callGeminiGenerateContent(
  apiKey: string,
  modelName: string,
  apiVersion: string,
  prompt: string,
  useJsonMime: boolean
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

  const generationConfig: any = {
    temperature: 0.2,
    maxOutputTokens: 4096,
  };
  if (useJsonMime) {
    generationConfig.responseMimeType = 'application/json';
  }

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('No candidates returned from Gemini API.');
  }

  const part = candidate.content?.parts?.[0];
  if (!part || !part.text) {
    throw new Error('No text content found in Gemini response.');
  }

  return part.text;
}

/**
 * Bulletproof JSON Parser & Sanitizer:
 * Sanitizes syntax imperfections, and falls back to property-level regex extraction
 * so malformed quotes or trailing commas in the AI response never cause a failure.
 */
function parseGeminiResponse(
  raw: string,
  fallbackTitle: string,
  fallbackSummary: string,
  fallbackSkills: SkillCategory[]
): ParsedAlignmentOutput {
  // 1. Sanitize string
  let clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }

  // Remove trailing commas before } or ]
  clean = clean.replace(/,\s*([\]}])/g, '$1');

  // Fix missing commas between objects: } { -> }, {
  clean = clean.replace(/}\s*\{/g, '},{');

  // Fix unescaped newlines inside strings
  clean = clean.replace(/"([^"\\]*(?:\\[\s\S][^"\\]*)*)"/g, (match) => {
    return match.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t');
  });

  try {
    const parsed = JSON.parse(clean);
    return {
      jobTitle: parsed.jobTitle || fallbackTitle,
      company: parsed.company || '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      tailoredSummary: parsed.tailoredSummary || fallbackSummary,
      recommendedSkills:
        Array.isArray(parsed.recommendedSkills) && parsed.recommendedSkills.length > 0
          ? parsed.recommendedSkills
          : fallbackSkills,
      rationale: parsed.rationale || '',
    };
  } catch (parseErr: any) {
    console.warn('Standard JSON.parse failed, running resilient fallback extractor:', parseErr?.message);

    // 2. Resilient Regex Extraction fallback
    const titleMatch = raw.match(/"jobTitle"\s*:\s*"([^"]+)"/i);
    const companyMatch = raw.match(/"company"\s*:\s*"([^"]*)"/i);
    const summaryMatch = raw.match(/"tailoredSummary"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
    const rationaleMatch = raw.match(/"rationale"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);

    // Extract keywords
    const keywords: Array<{ keyword: string; category: string; matched: boolean }> = [];
    const keywordRegex = /"keyword"\s*:\s*"([^"]+)"(?:\s*,\s*"category"\s*:\s*"([^"]+)")?/gi;
    let km;
    while ((km = keywordRegex.exec(raw)) !== null) {
      const kw = km[1].trim();
      const cat = (km[2] || 'technical').toLowerCase();
      if (kw && !keywords.some((k) => k.keyword.toLowerCase() === kw.toLowerCase())) {
        keywords.push({
          keyword: kw,
          category: ['technical', 'tool', 'methodology', 'domain'].includes(cat) ? cat : 'technical',
          matched: false,
        });
      }
    }

    // Extract recommendedSkills categories and items
    const skills: SkillCategory[] = [];
    const catBlockRegex = /"category"\s*:\s*"([^"]+)"\s*,\s*"items"\s*:\s*\[([^\]]*)\]/gi;
    let cbm;
    while ((cbm = catBlockRegex.exec(raw)) !== null) {
      const catName = cbm[1].trim();
      const itemsRaw = cbm[2];
      const items = itemsRaw
        .split(',')
        .map((i) => i.replace(/^[\s"'\\]+|[\s"'\\]+$/g, '').trim())
        .filter(Boolean);
      if (catName && items.length > 0) {
        skills.push({ category: catName, items });
      }
    }

    return {
      jobTitle: titleMatch ? titleMatch[1].trim() : fallbackTitle,
      company: companyMatch ? companyMatch[1].trim() : '',
      keywords,
      tailoredSummary: summaryMatch ? summaryMatch[1].replace(/\\n/g, '\n').trim() : fallbackSummary,
      recommendedSkills: skills.length > 0 ? skills : fallbackSkills,
      rationale: rationaleMatch ? rationaleMatch[1].trim() : '',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: AlignRequestBody = await req.json();
    const { jobDescription, currentResume, clientApiKey } = body;

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description is required.' },
        { status: 400 }
      );
    }

    const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No Gemini API key provided. Please provide a Google AI Studio API key or set GEMINI_API_KEY in your environment.',
          code: 'MISSING_API_KEY',
        },
        { status: 400 }
      );
    }

    // 1. Discover available models for this specific API key
    const discovery = await discoverModels(apiKey);
    if (discovery.error) {
      return NextResponse.json(
        { error: discovery.error, code: 'AUTH_OR_PERMISSION_ERROR' },
        { status: 400 }
      );
    }

    let candidateQueue: DiscoveredModel[] = [];
    if (discovery.models.length > 0) {
      candidateQueue = rankDiscoveredModels(discovery.models);
    } else {
      candidateQueue = [
        { name: 'gemini-2.5-flash', version: 'v1beta' },
        { name: 'gemini-flash-latest', version: 'v1beta' },
        { name: 'gemini-2.0-flash', version: 'v1beta' },
        { name: 'gemini-1.5-flash', version: 'v1beta' },
      ];
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) Optimization and Resume Alignment Specialist.
Your task is to analyze a real-world job posting (which may be messy, copy-pasted from LinkedIn, Greenhouse, Lever, Workday, etc.) and align the candidate's resume for maximum ATS search visibility and interview callbacks.

### Target Candidate Profile (Alex Li):
- Background: Physical product design, hardware prototyping, mechanical/ergonomic keyboards, digital fabrication, AI workflows, facade engineering.
- Degrees: Master of Architecture (M.Arch, Calgary), Bachelor of Environmental Design (B.EnvD, UBC).
- Experience: Founder & Lead Designer (Kurokeebs), Architectural Intern (HCMA), Design Consultant (Various).
- Skills: Rhino 3D, Grasshopper, SolidWorks, AutoCAD, Revit, BIM, KiCAD, Ergogen, FDM 3D Printing, Laser-cutting, CNC, SMD Hand-Soldering, Physical Computing, DFM, Human-Centered Design, ComfyUI, Stable Diffusion, Python.

### CRITICAL RULES:
1. RULE #2 (Job Title Alignment): Detect the EXACT official job title from the posting (e.g. "Senior Hardware Prototyping Engineer", "Industrial Designer", "Lead Product Design Engineer"). Strip company names, requisitions (e.g. "Req #12345"), emojis, locations, and boilerplate.
2. EXTRACT 25–35 ATS KEYWORDS: Extract 25–35 essential hard skills, CAD/software tools, engineering methodologies, and domain terms directly from the job posting. Do NOT include generic boilerplate noise (e.g., "equal opportunity", "benefits", "health insurance", "team player", "verbal communication", "san francisco", "401k").
3. POSITIONING SUMMARY BUDGET: Generate a strictly TWO-LINE Positioning Summary tailored to this job.
   - Line 1: Target job title + candidate's core design philosophy / specialization aligned with the posting.
   - Line 2: Proven hands-on track record from concept through rapid prototyping, fabrication, electronics, and production.
   - You MUST separate Line 1 and Line 2 with an escaped newline character ("\\n"). It must NOT exceed 2 lines so the resume stays strictly within the 1-page Letter format budget.
4. NO HALLUCINATIONS: Do NOT invent fake past employers, fake companies, or fake degrees for Alex. Map Alex's authentic capabilities into the exact phrasing and terminology preferred by the employer (e.g. if the posting says "Surface Modeling" instead of "3D Modeling", use the employer's term).
5. SKILLS ALIGNMENT: Categorize skills matching the employer's vocabulary while retaining Alex's core competencies.
6. JSON FORMAT INTEGRITY: Return strictly valid JSON. Do NOT use unescaped double quotes inside string values. Escape all quotes inside values as \\" or use single quotes.

### JOB POSTING:
"""
${jobDescription.slice(0, 10000)}
"""

### CURRENT RESUME SNAPSHOT:
- Current Target Title: ${currentResume.targetJobTitle}
- Current Summary: ${currentResume.summary}
- Current Skills: ${JSON.stringify(currentResume.skills.map((s) => `${s.category}: ${s.items.join(', ')}`))}

### REQUIRED JSON OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this exact structure:
{
  "jobTitle": "Exact Official Job Title",
  "company": "Company Name (or empty string if not found)",
  "keywords": [
    {
      "keyword": "Exact Term",
      "category": "technical" | "tool" | "methodology" | "domain",
      "inJobDescription": true,
      "matched": true | false
    }
  ],
  "tailoredSummary": "Line 1 of summary\\nLine 2 of summary",
  "recommendedSkills": [
    {
      "category": "Category Name",
      "items": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ],
  "rationale": "1-2 sentence explanation of how the alignment improves ATS ranking without altering authentic background."
}
`;

    let textResult = '';
    let usedModelName = '';
    const attemptErrors: string[] = [];

    // Try candidates in prioritized order
    for (const candidate of candidateQueue.slice(0, 6)) {
      // 1. Try with responseMimeType: application/json
      try {
        textResult = await callGeminiGenerateContent(apiKey, candidate.name, candidate.version, prompt, true);
        usedModelName = candidate.name;
        if (textResult) break;
      } catch (err: any) {
        // 2. If rejected, retry without responseMimeType
        try {
          textResult = await callGeminiGenerateContent(apiKey, candidate.name, candidate.version, prompt, false);
          usedModelName = candidate.name;
          if (textResult) break;
        } catch (retryErr: any) {
          attemptErrors.push(`${candidate.name}: ${retryErr?.message || err?.message}`);
        }
      }
    }

    if (!textResult) {
      return NextResponse.json(
        {
          error: `Gemini generation error across available models: ${attemptErrors.join(' | ')}. You can also use the Offline Heuristic Alignment.`,
          code: 'GENERATION_FAILED',
        },
        { status: 500 }
      );
    }

    // Bulletproof JSON parsing & regex extraction
    const heuristicTitle = extractJobTitle(jobDescription);
    const parsedData = parseGeminiResponse(
      textResult,
      heuristicTitle || currentResume.targetJobTitle,
      currentResume.summary,
      currentResume.skills
    );

    // If keywords list from AI was empty, use heuristic keyword analysis as fallback
    let candidateKeywords = parsedData.keywords;
    if (candidateKeywords.length === 0) {
      const fallbackAnalysis = analyzeJobKeywords(jobDescription, currentResume);
      candidateKeywords = fallbackAnalysis.keywords;
    }

    // Calculate countInResume for each keyword against current resume
    const resumeFullText = [
      currentResume.name,
      currentResume.targetJobTitle,
      currentResume.summary,
      ...currentResume.education.map((e) => `${e.institution} ${e.degree} ${e.details.join(' ')}`),
      ...currentResume.experience.map((e) => `${e.company} ${e.role} ${e.highlights.join(' ')}`),
      ...currentResume.projects.map((p) => `${p.name} ${p.subtitle} ${p.awards || ''} ${p.highlights.join(' ')}`),
      ...currentResume.skills.flatMap((s) => [s.category, ...s.items]),
      ...currentResume.languages,
    ].join(' ').toLowerCase();

    const enrichedKeywords: KeywordMatch[] = candidateKeywords.map((k: any) => {
      const escaped = (k.keyword || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      const matches = resumeFullText.match(regex);
      const count = matches ? matches.length : 0;
      return {
        keyword: k.keyword,
        category: ['technical', 'tool', 'methodology', 'domain'].includes(k.category) ? k.category : 'technical',
        countInResume: count,
        inJobDescription: true,
        matched: count > 0 || !!k.matched,
      };
    });

    const matchedCount = enrichedKeywords.filter((k) => k.matched).length;
    const totalKeywords = enrichedKeywords.length;

    let sweetSpotStatus: 'under' | 'optimal' | 'over' = 'optimal';
    let recommendation = '';

    if (matchedCount < 25) {
      sweetSpotStatus = 'under';
      recommendation = `Currently matching ${matchedCount} keywords. ATS requires 25–35 exact keywords to rank in top search results. Apply alignment to reach the sweet spot.`;
    } else if (matchedCount > 35) {
      sweetSpotStatus = 'over';
      recommendation = `Currently matching ${matchedCount} keywords. Exceeding 35 keywords risks tripping newer AI keyword-stuffing detectors. Aim for 25–35.`;
    } else {
      sweetSpotStatus = 'optimal';
      recommendation = `Target met: ${matchedCount} matched keywords. Inside the 25–35 sweet spot where interview callbacks increase significantly.`;
    }

    const densityScore = Math.min(
      100,
      Math.round(
        matchedCount >= 25 && matchedCount <= 35
          ? 95 + (matchedCount - 25) * 0.5
          : matchedCount < 25
          ? (matchedCount / 25) * 85
          : 100 - (matchedCount - 35) * 3
      )
    );

    return NextResponse.json({
      jobTitle: parsedData.jobTitle || currentResume.targetJobTitle,
      company: parsedData.company || '',
      keywords: enrichedKeywords,
      totalKeywordsExtracted: totalKeywords,
      matchedCount,
      densityScore,
      sweetSpotStatus,
      recommendation,
      tailoredSummary: parsedData.tailoredSummary || currentResume.summary,
      recommendedSkills: parsedData.recommendedSkills || currentResume.skills,
      rationale: parsedData.rationale || '',
      modelUsed: usedModelName,
    });
  } catch (error: any) {
    console.error('Gemini Alignment API Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to align resume with Gemini AI.',
        code: error?.status || 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
