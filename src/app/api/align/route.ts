import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData, KeywordMatch } from '@/types/resume';

interface AlignRequestBody {
  jobDescription: string;
  currentResume: ResumeData;
  clientApiKey?: string;
}

interface ResolvedModelInfo {
  modelName: string;
  apiVersion: string;
  availableModels: string[];
}

/**
 * Dynamically discovers supported generative models for the user's API key
 * by inspecting Google's ListModels API on v1beta and v1.
 */
async function resolveAvailableModel(apiKey: string): Promise<ResolvedModelInfo> {
  const versions = ['v1beta', 'v1'];
  let lastError: any = null;
  const discovered: { name: string; version: string; methods: string[] }[] = [];

  for (const ver of versions) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`);
      const data = await res.json();

      if (data.error) {
        lastError = data.error;
        continue;
      }

      if (Array.isArray(data.models)) {
        for (const m of data.models) {
          discovered.push({
            name: (m.name || '').replace(/^models\//, ''),
            version: ver,
            methods: m.supportedGenerationMethods || [],
          });
        }
        if (discovered.length > 0) {
          break;
        }
      }
    } catch (e: any) {
      // Continue to next version
    }
  }

  // Filter models that support generateContent
  const contentModels = discovered.filter((m) =>
    m.methods.includes('generateContent')
  );

  if (contentModels.length > 0) {
    const priorityPatterns = [
      /^gemini-2\.0-flash$/i,
      /^gemini-2\.0/i,
      /^gemini-1\.5-flash$/i,
      /^gemini-1\.5-flash-latest$/i,
      /^gemini-1\.5-flash-002$/i,
      /^gemini-1\.5-flash-001$/i,
      /^gemini-1\.5-flash/i,
      /^gemini-1\.5-pro$/i,
      /^gemini-1\.5-pro-latest$/i,
      /^gemini-1\.5-pro/i,
      /^gemini-pro$/i,
      /^gemini-1\.0-pro$/i,
      /^gemini/i,
    ];

    for (const pattern of priorityPatterns) {
      const match = contentModels.find((m) => pattern.test(m.name));
      if (match) {
        return {
          modelName: match.name,
          apiVersion: match.version,
          availableModels: contentModels.map((m) => m.name),
        };
      }
    }

    return {
      modelName: contentModels[0].name,
      apiVersion: contentModels[0].version,
      availableModels: contentModels.map((m) => m.name),
    };
  }

  // If Google API returned an explicit error, throw an informative message
  if (lastError) {
    const rawMsg = lastError.message || JSON.stringify(lastError);
    if (rawMsg.includes('API key not valid')) {
      throw new Error('API key is invalid. Please verify your Google AI Studio API key in AI Settings.');
    }
    if (rawMsg.includes('Generative Language API has not been used') || rawMsg.includes('disabled')) {
      throw new Error(
        'The Generative Language API is disabled for this key project. Please enable it in Google Cloud Console or create a free key at https://aistudio.google.com/app/apikey.'
      );
    }
    throw new Error(`Google API: ${rawMsg}`);
  }

  // Fallback defaults if listing was blocked
  return {
    modelName: 'gemini-2.0-flash',
    apiVersion: 'v1beta',
    availableModels: [],
  };
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
    let modelSelection: ResolvedModelInfo;
    try {
      modelSelection = await resolveAvailableModel(apiKey);
    } catch (discoveryErr: any) {
      return NextResponse.json(
        {
          error: discoveryErr?.message || 'Failed to authenticate with Google Gemini API.',
          code: 'AUTH_OR_PERMISSION_ERROR',
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

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
   - You MUST separate Line 1 and Line 2 with a single newline character ("\\n"). It must NOT exceed 2 lines so the resume stays strictly within the 1-page Letter format budget.
4. NO HALLUCINATIONS: Do NOT invent fake past employers, fake companies, or fake degrees for Alex. Map Alex's authentic capabilities into the exact phrasing and terminology preferred by the employer (e.g. if the posting says "Surface Modeling" instead of "3D Modeling", use the employer's term).
5. SKILLS ALIGNMENT: Categorize skills matching the employer's vocabulary while retaining Alex's core competencies.

### JOB POSTING:
"""
${jobDescription.slice(0, 10000)}
"""

### CURRENT RESUME SNAPSHOT:
- Current Target Title: ${currentResume.targetJobTitle}
- Current Summary: ${currentResume.summary}
- Current Skills: ${JSON.stringify(currentResume.skills.map(s => `${s.category}: ${s.items.join(', ')}`))}

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

    // 2. Build candidate queue starting with the resolved model
    const candidateQueue: { model: string; apiVersion?: string }[] = [];

    if (modelSelection.modelName) {
      candidateQueue.push({
        model: modelSelection.modelName,
        apiVersion: modelSelection.apiVersion,
      });
    }

    const fallbacks = [
      { model: 'gemini-2.0-flash', apiVersion: 'v1beta' },
      { model: 'gemini-1.5-flash-latest', apiVersion: 'v1beta' },
      { model: 'gemini-1.5-flash', apiVersion: 'v1' },
      { model: 'gemini-1.5-flash', apiVersion: 'v1beta' },
      { model: 'gemini-1.5-pro', apiVersion: 'v1beta' },
      { model: 'gemini-pro', apiVersion: 'v1' },
    ];

    for (const fb of fallbacks) {
      if (!candidateQueue.some((c) => c.model === fb.model && c.apiVersion === fb.apiVersion)) {
        candidateQueue.push(fb);
      }
    }

    let textResult = '';
    let usedModelName = '';
    let lastGenError: any = null;

    for (const candidate of candidateQueue) {
      try {
        const generationConfig: any = {
          temperature: 0.2,
        };
        // responseMimeType is supported on gemini-1.5 and gemini-2.0
        if (!candidate.model.includes('gemini-1.0') && candidate.model !== 'gemini-pro') {
          generationConfig.responseMimeType = 'application/json';
        }

        const model = genAI.getGenerativeModel(
          {
            model: candidate.model,
            generationConfig,
          },
          candidate.apiVersion ? { apiVersion: candidate.apiVersion } : undefined
        );

        const response = await model.generateContent(prompt);
        textResult = response.response.text();
        usedModelName = candidate.model;
        if (textResult) break;
      } catch (err: any) {
        lastGenError = err;
        console.warn(`Model attempt failed [${candidate.model} on ${candidate.apiVersion}]:`, err?.message);
      }
    }

    if (!textResult) {
      const errDetail = lastGenError?.message || 'All candidate Gemini models failed to generate content.';
      return NextResponse.json(
        {
          error: `Gemini generation error: ${errDetail}. Available models on this key: [${modelSelection.availableModels.join(', ') || 'none found'}]. You can also use the Offline Heuristic Alignment.`,
          code: 'GENERATION_FAILED',
        },
        { status: 500 }
      );
    }

    // 3. Robust JSON extraction
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'AI did not return valid structured JSON.', code: 'INVALID_AI_RESPONSE' },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(jsonMatch[0]);

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

    const enrichedKeywords: KeywordMatch[] = (parsedData.keywords || []).map((k: any) => {
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
