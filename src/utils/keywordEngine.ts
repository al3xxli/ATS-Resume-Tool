import { ResumeData, KeywordMatch, JobAnalysisResult } from '@/types/resume';

// Curated dictionary of high-value industry, engineering, and design keywords to identify in postings
const KNOWN_INDUSTRY_TERMS: { word: string; category: KeywordMatch['category'] }[] = [
  // Tools & Software
  { word: 'Rhino 3D', category: 'tool' },
  { word: 'Rhino', category: 'tool' },
  { word: 'Grasshopper', category: 'tool' },
  { word: 'SolidWorks', category: 'tool' },
  { word: 'AutoCAD', category: 'tool' },
  { word: 'Revit', category: 'tool' },
  { word: 'BIM', category: 'technical' },
  { word: 'KiCAD', category: 'tool' },
  { word: 'Ergogen', category: 'tool' },
  { word: 'ComfyUI', category: 'tool' },
  { word: 'Stable Diffusion', category: 'technical' },
  { word: 'Ollama', category: 'tool' },
  { word: 'LMStudio', category: 'tool' },
  { word: 'Python', category: 'tool' },
  { word: 'Figma', category: 'tool' },
  { word: 'Adobe Creative Suite', category: 'tool' },
  { word: 'Photoshop', category: 'tool' },
  { word: 'Illustrator', category: 'tool' },
  { word: 'InDesign', category: 'tool' },
  { word: 'Twinmotion', category: 'tool' },
  { word: 'DaVinci Resolve', category: 'tool' },

  // Fabrication & Hardware
  { word: 'FDM 3D Printing', category: 'technical' },
  { word: '3D Printing', category: 'technical' },
  { word: 'Laser-cutting', category: 'technical' },
  { word: 'Precision Cutting', category: 'technical' },
  { word: 'CNC', category: 'technical' },
  { word: 'Rapid Prototyping', category: 'methodology' },
  { word: 'PCB Design', category: 'technical' },
  { word: 'SMD Hand-Soldering', category: 'technical' },
  { word: 'Microcontrollers', category: 'technical' },
  { word: 'Physical Computing', category: 'technical' },
  { word: 'Design for Manufacturing', category: 'methodology' },
  { word: 'DFM', category: 'methodology' },
  { word: 'Surface Modeling', category: 'technical' },
  { word: 'Parametric Modeling', category: 'technical' },
  { word: 'Digital Fabrication', category: 'technical' },

  // Methodologies & Practices
  { word: 'Human-Centered Design', category: 'methodology' },
  { word: 'Human-In-The-Loop AI', category: 'methodology' },
  { word: 'User Testing', category: 'methodology' },
  { word: 'Ergonomics', category: 'methodology' },
  { word: 'Iterative Design', category: 'methodology' },
  { word: 'Material Exploration', category: 'methodology' },
  { word: 'Cross-Functional Collaboration', category: 'domain' },
  { word: 'Technical Documentation', category: 'domain' },
  { word: 'Drawing Packages', category: 'domain' },
  { word: 'BOM Management', category: 'domain' },
  { word: 'Tolerance Analysis', category: 'domain' },
  { word: 'Facade Systems', category: 'domain' },
  { word: 'Closed-Loop Systems', category: 'domain' },
  { word: 'Performance Optimization', category: 'methodology' },
  { word: 'Algorithm Development', category: 'technical' },
];

/**
 * Extracts a candidate job title from job description text.
 */
export function extractJobTitle(text: string): string {
  if (!text) return 'Product Designer';

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Look for "Title: X" or "Position: X" or "Role: X"
  for (const line of lines) {
    const match = line.match(/^(?:title|position|role|job title)\s*:\s*(.+)$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Look for first clean line that looks like a title (e.g. 2-5 words, no punctuation at end)
  for (const line of lines.slice(0, 5)) {
    if (
      line.length >= 5 &&
      line.length <= 50 &&
      !line.includes('http') &&
      !line.includes('@') &&
      !line.endsWith('.') &&
      !line.toLowerCase().includes('about the') &&
      !line.toLowerCase().includes('overview')
    ) {
      return line.replace(/^#+\s*/, '').trim();
    }
  }

  return 'Hardware Product Designer';
}

/**
 * Normalizes resume text to search for keywords accurately.
 */
function getResumeFullText(resume: ResumeData): string {
  const parts: string[] = [
    resume.name,
    resume.targetJobTitle,
    resume.summary,
    ...resume.education.map((e) => `${e.institution} ${e.degree} ${e.details.join(' ')}`),
    ...resume.experience.map((e) => `${e.company} ${e.role} ${e.highlights.join(' ')}`),
    ...resume.projects.map((p) => `${p.name} ${p.subtitle} ${p.awards || ''} ${p.highlights.join(' ')}`),
    ...resume.skills.flatMap((s) => [s.category, ...s.items]),
    ...resume.languages,
  ];
  return parts.join(' ').toLowerCase();
}

/**
 * Counts occurrences of keyword in text using boundary-aware regex.
 */
function countKeywordOccurrences(text: string, keyword: string): number {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Analyzes a job description against the resume.
 */
export function analyzeJobKeywords(
  jobDescription: string,
  resume: ResumeData
): JobAnalysisResult {
  const jobTextLower = jobDescription.toLowerCase();
  const resumeFullText = getResumeFullText(resume);
  const detectedTitle = extractJobTitle(jobDescription);

  const matchedKeywords: KeywordMatch[] = [];
  const foundWords = new Set<string>();

  // 1. Scan known industry terms
  for (const item of KNOWN_INDUSTRY_TERMS) {
    const inJob = jobTextLower.includes(item.word.toLowerCase());
    if (inJob && !foundWords.has(item.word.toLowerCase())) {
      foundWords.add(item.word.toLowerCase());
      const count = countKeywordOccurrences(resumeFullText, item.word);
      matchedKeywords.push({
        keyword: item.word,
        category: item.category,
        countInResume: count,
        inJobDescription: true,
        matched: count > 0,
      });
    }
  }

  // 2. Scan capitalized phrases & technologies from job description
  const tokenRegex = /\b([A-Z][a-zA-Z0-9+#]+(?:\s+[A-Z][a-zA-Z0-9+#]+)*)\b/g;
  let match;
  while ((match = tokenRegex.exec(jobDescription)) !== null) {
    const candidate = match[1].trim();
    const candidateLower = candidate.toLowerCase();
    const commonWords = [
      'the', 'and', 'for', 'with', 'about', 'role', 'responsibilities',
      'qualifications', 'requirements', 'company', 'location', 'san francisco',
      'calgary', 'toronto', 'vancouver', 'remote', 'hybrid', 'bachelor', 'master',
      'experience', 'degree', 'proven', 'strong', 'key', 'lead', 'team',
    ];

    if (
      candidate.length >= 3 &&
      !commonWords.includes(candidateLower) &&
      !foundWords.has(candidateLower) &&
      matchedKeywords.length < 40
    ) {
      foundWords.add(candidateLower);
      const count = countKeywordOccurrences(resumeFullText, candidate);
      matchedKeywords.push({
        keyword: candidate,
        category: 'technical',
        countInResume: count,
        inJobDescription: true,
        matched: count > 0,
      });
    }
  }

  const totalExtracted = matchedKeywords.length;
  const matchedCount = matchedKeywords.filter((k) => k.matched).length;

  // Sweet spot calculation (guideline: 25-35 keywords)
  let sweetSpotStatus: 'under' | 'optimal' | 'over' = 'optimal';
  let recommendation = '';

  if (matchedCount < 25) {
    sweetSpotStatus = 'under';
    recommendation = `Currently matching ${matchedCount} keywords. ATS requires 25–35 exact keywords to rank in top search results. Click 'Align Keywords' to reach optimal density.`;
  } else if (matchedCount > 35) {
    sweetSpotStatus = 'over';
    recommendation = `Currently matching ${matchedCount} keywords. Exceeding 35 keywords risks tripping newer AI keyword-stuffing detectors. Aim for 25–35.`;
  } else {
    sweetSpotStatus = 'optimal';
    recommendation = `Target met: ${matchedCount} matched keywords. You are inside the 25–35 sweet spot where interview callbacks increase significantly without tripping spam detectors.`;
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

  return {
    jobTitle: detectedTitle,
    totalKeywordsExtracted: totalExtracted,
    keywords: matchedKeywords,
    matchedCount,
    densityScore,
    sweetSpotStatus,
    recommendation,
  };
}

/**
 * Naturally weaves in missing target keywords into the resume to hit the 25-35 sweet spot.
 * Adheres strictly to the guidelines: exact words, no white text, naturally placed.
 */
export function alignResumeWithJob(
  currentResume: ResumeData,
  jobAnalysis: JobAnalysisResult
): ResumeData {
  const updated = JSON.parse(JSON.stringify(currentResume)) as ResumeData;

  // 1. Exact Job Title in Header (Rule 2: 10.6x callback boost!)
  if (jobAnalysis.jobTitle) {
    updated.targetJobTitle = jobAnalysis.jobTitle;
  }

  // 2. Identify missing keywords that can be added into skills or summary
  const missingKeywords = jobAnalysis.keywords
    .filter((k) => !k.matched)
    .map((k) => k.keyword);

  if (missingKeywords.length === 0) {
    return updated;
  }

  // Determine how many we need to reach the 25-35 sweet spot
  const currentCount = jobAnalysis.matchedCount;
  const neededToAdd = Math.max(0, Math.min(missingKeywords.length, 30 - currentCount));

  const keywordsToInject = missingKeywords.slice(0, neededToAdd);

  // Group keywords to place into existing skill categories
  const fabSkills = keywordsToInject.filter((k) =>
    /prototyp|print|fabricat|cut|machin|dfm|manufactur|cnc|toleran/i.test(k)
  );
  const cadSkills = keywordsToInject.filter((k) =>
    /rhino|cad|solidworks|revit|bim|parametric|surface|model|grasshopper/i.test(k)
  );
  const aiSkills = keywordsToInject.filter((k) =>
    /ai|comfy|diffusion|llm|python|generat|script|algorithm/i.test(k)
  );
  const hardwareSkills = keywordsToInject.filter((k) =>
    /pcb|kicad|solder|circuit|ergonomics|keyboard|bom|electr/i.test(k)
  );
  const generalSkills = keywordsToInject.filter(
    (k) =>
      !fabSkills.includes(k) &&
      !cadSkills.includes(k) &&
      !aiSkills.includes(k) &&
      !hardwareSkills.includes(k)
  );

  // Inject into skill categories cleanly
  updated.skills = updated.skills.map((category) => {
    const catLower = category.category.toLowerCase();
    const newItems = [...category.items];

    if (catLower.includes('fabrication') && fabSkills.length > 0) {
      fabSkills.forEach((s) => {
        if (!newItems.includes(s)) newItems.push(s);
      });
    } else if (catLower.includes('cad') && cadSkills.length > 0) {
      cadSkills.forEach((s) => {
        if (!newItems.includes(s)) newItems.push(s);
      });
    } else if (catLower.includes('ai') && aiSkills.length > 0) {
      aiSkills.forEach((s) => {
        if (!newItems.includes(s)) newItems.push(s);
      });
    } else if (catLower.includes('electronics') && hardwareSkills.length > 0) {
      hardwareSkills.forEach((s) => {
        if (!newItems.includes(s)) newItems.push(s);
      });
    }
    return { ...category, items: newItems };
  });

  // If there are general domain keywords, merge into first category without adding extra lines
  if (generalSkills.length > 0 && updated.skills.length > 0) {
    const targetCat = updated.skills[0];
    generalSkills.forEach((s) => {
      if (!targetCat.items.includes(s)) targetCat.items.push(s);
    });
  }

  // Update summary concisely to include target title while fitting single page
  if (!updated.summary.toLowerCase().includes(updated.targetJobTitle.toLowerCase())) {
    updated.summary = `${updated.targetJobTitle} focused on physical products, human use, and material exploration. Experienced taking products from concept through rapid prototyping, electronics, and digital fabrication.`;
  }

  return updated;
}
