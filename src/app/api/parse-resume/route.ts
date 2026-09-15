import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import { ResumeData } from '@/types/resume';
import { cleanPdfLigatures, parseResumeTextHeuristically } from '@/utils/pdfResumeParser';

export const runtime = 'nodejs';

interface ParseRequestBody {
  pdfBase64: string;
  fileName?: string;
  clientApiKey?: string;
}

interface DiscoveredModel {
  name: string;
  version: string;
}

/**
 * Discovers available Gemini generation models for the user's API key.
 */
async function discoverModels(apiKey: string): Promise<DiscoveredModel[]> {
  const versions = ['v1beta', 'v1'];
  const allDiscovered: DiscoveredModel[] = [];

  for (const ver of versions) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`);
      const data = await res.json();

      if (Array.isArray(data.models)) {
        for (const m of data.models) {
          const rawName = (m.name || '').replace(/^models\//, '');
          const methods: string[] = m.supportedGenerationMethods || [];

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

        if (allDiscovered.length > 0) break;
      }
    } catch {
      // Continue to next version
    }
  }

  return allDiscovered;
}

/**
 * Sorts discovered models by preference for fast multimodal document extraction.
 */
function rankDiscoveredModels(models: DiscoveredModel[]): DiscoveredModel[] {
  const priorityPatterns = [
    /^gemini-2\.5-flash$/i,
    /^gemini-flash-latest$/i,
    /^gemini-2\.5-flash-lite$/i,
    /^gemini-flash-lite-latest$/i,
    /^gemini-2\.5-pro$/i,
    /^gemini-2\.0-flash$/i,
    /^gemini-1\.5-flash$/i,
    /^gemini-pro$/i,
  ];

  return [...models].sort((a, b) => {
    let aRank = priorityPatterns.findIndex((p) => p.test(a.name));
    let bRank = priorityPatterns.findIndex((p) => p.test(b.name));
    if (aRank === -1) aRank = 999;
    if (bRank === -1) bRank = 999;
    return aRank - bRank;
  });
}

/**
 * Sanitizes and repairs common LLM JSON syntax flaws.
 */
function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Fix literal control characters
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, '');

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body: ParseRequestBody = await req.json();
    const { pdfBase64, fileName, clientApiKey } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: 'Missing PDF base64 data.' }, { status: 400 });
    }

    // Decode base64 to binary buffer
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');

    // Extract text and total pages with unpdf
    let extractedText = '';
    let totalPages = 1;
    try {
      const pdfData = await extractText(new Uint8Array(pdfBuffer));
      extractedText = Array.isArray(pdfData.text) ? pdfData.text.join('\n') : String(pdfData.text || '');
      totalPages = pdfData.totalPages || 1;
    } catch (extractErr) {
      console.warn('unpdf text extraction encountered warning:', extractErr);
    }

    const sanitizedText = cleanPdfLigatures(extractedText);

    // Check for API key (Client BYOK or Server env)
    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || '').trim();

    if (apiKey) {
      try {
        const discovered = await discoverModels(apiKey);
        const candidateModels =
          discovered.length > 0
            ? rankDiscoveredModels(discovered)
            : [
                { name: 'gemini-2.5-flash', version: 'v1beta' },
                { name: 'gemini-flash-latest', version: 'v1beta' },
                { name: 'gemini-2.5-flash-lite', version: 'v1beta' },
              ];

        const systemPrompt = `You are a world-class ATS (Applicant Tracking System) resume extraction engine.
Analyze the provided PDF resume document and its extracted text stream.
Your task is to accurately extract and convert the resume into a single-page ATS-optimized ResumeData JSON structure.

CRITICAL INSTRUCTIONS:
1. Fix broken font ligatures and private Unicode glyphs:
   - "workow" -> "workflow"
   - "rm’s" -> "firm's"
   - "ecient" -> "efficient"
   - "Diusion" -> "Diffusion"
   - "agship" -> "flagship"
2. Candidate Name & Title:
   - Extract the candidate's exact full name.
   - For targetJobTitle, extract their primary professional title or headline (e.g. "Hardware Product Designer & Prototyper" or "Senior Mechanical Engineer"). If not explicitly written, infer the title from their most senior recent role.
3. Summary:
   - Create a crisp, high-impact 2-line Positioning Summary separated by a literal "\\n" newline character (e.g. "Line 1\\nLine 2") to preserve the single-page Letter page budget.
4. Contact Info:
   - Extract phone, email, LinkedIn URL, portfolio/personal website, and location (City, State/Province, Country).
5. Education:
   - Extract institution, degree, dateRange, location (optional), and key distinction/details.
6. Experience:
   - Extract company, role, location, dateRange, and an array of strong bullet highlights with quantified metrics.
7. Projects:
   - Extract name, subtitle, dateRange, awards (optional), and bullet highlights.
8. Skills & Languages:
   - Group technical skills into clean categories (e.g. "Electronics & Code", "Digital Fabrication", "3D & CAD Modeling", "AI Workflows", "Visual & Prototyping").
   - Extract languages into a string array (e.g. ["English", "Mandarin Chinese"]).
9. ZERO HALLUCINATION:
   - Only extract information present in the source PDF. Never invent fake companies, schools, or metrics.

OUTPUT FORMAT:
Return ONLY a valid JSON object strictly adhering to this schema:
{
  "name": "string",
  "targetJobTitle": "string",
  "summary": "string",
  "contact": {
    "phone": "string",
    "email": "string",
    "linkedin": "string",
    "portfolio": "string",
    "location": "string"
  },
  "education": [
    {
      "id": "edu-1",
      "institution": "string",
      "degree": "string",
      "location": "string",
      "dateRange": "string",
      "details": ["string"]
    }
  ],
  "experience": [
    {
      "id": "exp-1",
      "company": "string",
      "role": "string",
      "location": "string",
      "dateRange": "string",
      "highlights": ["string"]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "string",
      "subtitle": "string",
      "awards": "string",
      "dateRange": "string",
      "highlights": ["string"]
    }
  ],
  "skills": [
    {
      "category": "string",
      "items": ["string"]
    }
  ],
  "languages": ["string"]
}`;

        // Attempt generation with candidate models
        for (const model of candidateModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        inline_data: {
                          mime_type: 'application/pdf',
                          data: cleanBase64,
                        },
                      },
                      {
                        text: `${systemPrompt}\n\nEXTRACTED TEXT STREAM FOR REFERENCE:\n${sanitizedText}`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 8192,
                  responseMimeType: 'application/json',
                },
              }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
              console.warn(`Model ${model.name} returned error:`, data.error?.message || response.statusText);
              continue;
            }

            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const sanitizedJson = sanitizeJsonString(candidateText);
              const parsed: ResumeData = JSON.parse(sanitizedJson);

              // Validate minimum structure
              if (parsed.name && (parsed.experience?.length || parsed.education?.length)) {
                // Ensure IDs are present
                parsed.education = (parsed.education || []).map((e, idx) => ({
                  ...e,
                  id: e.id || `edu-${idx + 1}`,
                }));
                parsed.experience = (parsed.experience || []).map((e, idx) => ({
                  ...e,
                  id: e.id || `exp-${idx + 1}`,
                }));
                parsed.projects = (parsed.projects || []).map((p, idx) => ({
                  ...p,
                  id: p.id || `proj-${idx + 1}`,
                }));

                return NextResponse.json({
                  success: true,
                  resume: parsed,
                  method: 'gemini',
                  modelUsed: model.name,
                  pageCount: totalPages,
                  fileName: fileName || 'Uploaded Resume',
                });
              }
            }
          } catch (modelErr) {
            console.warn(`Error generating with ${model.name}:`, modelErr);
          }
        }
      } catch (geminiOuterErr) {
        console.warn('Gemini extraction failed, proceeding to heuristic fallback:', geminiOuterErr);
      }
    }

    // Heuristic Fallback (Offline / No Key / Gemini Failed)
    const heuristicResume = parseResumeTextHeuristically(sanitizedText);

    return NextResponse.json({
      success: true,
      resume: heuristicResume,
      method: 'heuristic',
      pageCount: totalPages,
      fileName: fileName || 'Uploaded Resume',
      note: apiKey ? 'Parsed using offline heuristic engine due to API limits.' : 'Parsed using offline heuristic engine.',
    });
  } catch (error: any) {
    console.error('Fatal error in /api/parse-resume:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process PDF resume.',
      },
      { status: 500 }
    );
  }
}
