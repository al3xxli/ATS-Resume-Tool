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
  { word: 'KeyShot', category: 'tool' },
  { word: 'Blender', category: 'tool' },

  // Fabrication, Hardware & Engineering
  { word: 'FDM 3D Printing', category: 'technical' },
  { word: '3D Printing', category: 'technical' },
  { word: 'Laser-cutting', category: 'technical' },
  { word: 'Laser Cutting', category: 'technical' },
  { word: 'Precision Cutting', category: 'technical' },
  { word: 'CNC', category: 'technical' },
  { word: 'CNC Machining', category: 'technical' },
  { word: 'CNC Milling', category: 'technical' },
  { word: 'Rapid Prototyping', category: 'methodology' },
  { word: 'PCB Design', category: 'technical' },
  { word: 'SMD Hand-Soldering', category: 'technical' },
  { word: 'Soldering', category: 'technical' },
  { word: 'Microcontrollers', category: 'technical' },
  { word: 'Physical Computing', category: 'technical' },
  { word: 'Design for Manufacturing', category: 'methodology' },
  { word: 'DFM', category: 'methodology' },
  { word: 'DFA', category: 'methodology' },
  { word: 'GD&T', category: 'technical' },
  { word: 'Injection Molding', category: 'technical' },
  { word: 'Sheet Metal', category: 'technical' },
  { word: 'Tolerance Stackup', category: 'technical' },
  { word: 'Tolerance Analysis', category: 'domain' },
  { word: 'Surface Modeling', category: 'technical' },
  { word: 'Parametric Modeling', category: 'technical' },
  { word: 'Class-A Surfacing', category: 'technical' },
  { word: 'Digital Fabrication', category: 'technical' },
  { word: 'Mechatronics', category: 'domain' },
  { word: 'Circuit Design', category: 'technical' },
  { word: 'Closed-Loop Systems', category: 'domain' },
  { word: 'Closed-Loop Control', category: 'domain' },
  { word: 'BOM Management', category: 'domain' },
  { word: 'Bill of Materials', category: 'domain' },
  { word: 'Finite Element Analysis', category: 'technical' },
  { word: 'FEA', category: 'technical' },
  { word: 'Arduino', category: 'tool' },
  { word: 'ESP32', category: 'technical' },
  { word: 'Firmware', category: 'technical' },

  // Methodologies & Practices
  { word: 'Human-Centered Design', category: 'methodology' },
  { word: 'Human-In-The-Loop AI', category: 'methodology' },
  { word: 'User Testing', category: 'methodology' },
  { word: 'User Research', category: 'methodology' },
  { word: 'Ergonomics', category: 'methodology' },
  { word: 'Human Factors', category: 'methodology' },
  { word: 'Iterative Design', category: 'methodology' },
  { word: 'Iterative Prototyping', category: 'methodology' },
  { word: 'Material Exploration', category: 'methodology' },
  { word: 'Cross-Functional Collaboration', category: 'domain' },
  { word: 'Technical Documentation', category: 'domain' },
  { word: 'Drawing Packages', category: 'domain' },
  { word: 'Facade Systems', category: 'domain' },
  { word: 'Performance Optimization', category: 'methodology' },
  { word: 'Algorithm Development', category: 'technical' },
  { word: 'Design Verification', category: 'methodology' },
  { word: 'Design Validation', category: 'methodology' },
  { word: 'EVT', category: 'domain' },
  { word: 'DVT', category: 'domain' },
  { word: 'PVT', category: 'domain' },
];

// Common stopwords and boilerplate patterns to ignore
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'about', 'role', 'responsibilities',
  'qualifications', 'requirements', 'company', 'location', 'san francisco',
  'calgary', 'toronto', 'vancouver', 'remote', 'hybrid', 'bachelor', 'master',
  'experience', 'degree', 'proven', 'strong', 'key', 'lead', 'team', 'work',
  'years', 'skills', 'ability', 'must', 'have', 'working', 'opportunity',
  'equal', 'benefits', 'health', 'dental', 'vision', 'insurance', 'salary',
  'competitive', 'include', 'including', 'candidate', 'apply', 'join', 'culture',
  'position', 'overview', 'summary', 'ideal', 'preferred', 'minimum', 'plus',
]);

/**
 * Strips EEO, benefits, and boilerplate clauses from job descriptions.
 */
export function stripJobBoilerplate(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const filteredLines: string[] = [];

  let inBoilerplate = false;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();

    // Detect start of EEO / Benefits / Legal sections
    if (
      lower.includes('equal opportunity employer') ||
      lower.includes('affirmative action') ||
      lower.includes('benefits & perks') ||
      lower.includes('benefits and perks') ||
      lower.includes('what we offer') ||
      lower.includes('compensation and benefits') ||
      lower.includes('salary range') ||
      lower.includes('pay transparency') ||
      lower.includes('notice to recruitment agencies') ||
      lower.includes('background check') ||
      lower.includes('reasonable accommodation')
    ) {
      inBoilerplate = true;
    }

    // End of boilerplate markers if a new real section begins
    if (
      inBoilerplate &&
      (lower.startsWith('responsibilities:') ||
        lower.startsWith('requirements:') ||
        lower.startsWith('qualifications:') ||
        lower.startsWith('key duties:'))
    ) {
      inBoilerplate = false;
    }

    if (!inBoilerplate) {
      // Also filter out inline EEO phrases
      if (
        !lower.includes('race, color, religion') &&
        !lower.includes('gender identity or expression') &&
        !lower.includes('sexual orientation') &&
        !lower.includes('disability, or veteran status')
      ) {
        filteredLines.push(line);
      }
    }
  }

  return filteredLines.join('\n');
}

/**
 * Extracts a candidate job title from job description text.
 */
export function extractJobTitle(text: string): string {
  if (!text) return 'Product Designer';

  const cleaned = stripJobBoilerplate(text);
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Look for explicit title tags: "Title: X" or "Position: X" or "Role: X"
  for (const line of lines.slice(0, 20)) {
    const match = line.match(/^(?:title|position|role|job title|opening)\s*[:\-]\s*(.+)$/i);
    if (match && match[1]) {
      const cleanTitle = cleanTitleString(match[1]);
      if (cleanTitle) return cleanTitle;
    }
  }

  // 2. Score candidate lines using role keywords
  const roleKeywords = [
    'engineer', 'designer', 'architect', 'developer', 'specialist',
    'technologist', 'consultant', 'manager', 'lead', 'director',
    'prototyper', 'fabricator', 'researcher',
  ];

  let bestTitle = '';
  let bestScore = -1;

  for (const line of lines.slice(0, 15)) {
    const lower = line.toLowerCase();

    // Skip obviously non-title lines
    if (
      line.length < 5 ||
      line.length > 75 ||
      line.includes('http') ||
      line.includes('@') ||
      lower.includes('about the') ||
      lower.includes('who we are') ||
      lower.includes('overview') ||
      lower.includes('description') ||
      lower.includes('responsibilities') ||
      lower.includes('qualifications') ||
      lower.includes('requirements') ||
      lower.includes('apply now') ||
      line.endsWith('.')
    ) {
      continue;
    }

    let score = 0;
    for (const kw of roleKeywords) {
      if (lower.includes(kw)) score += 3;
    }
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal') || lower.includes('staff')) {
      score += 2;
    }
    if (lower.includes('product') || lower.includes('hardware') || lower.includes('industrial') || lower.includes('mechanical')) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTitle = cleanTitleString(line);
    }
  }

  if (bestTitle && bestScore >= 3) {
    return bestTitle;
  }

  return 'Hardware Product Designer';
}

function cleanTitleString(raw: string): string {
  return raw
    .replace(/^#+\s*/, '') // markdown headers
    .replace(/^\s*(?:\d+[\.\)]|[-*•])\s*/, '') // list numbers e.g. "1. ", "1) ", "- ", "• "
    .replace(/\s*\(?(?:remote|hybrid|on-?site|full-?time|part-?time|contract)\)?\s*$/i, '')
    .replace(/\s*\([a-z\s,]+(?:CA|US|NY|TX|WA|BC|AB|ON)\)\s*$/i, '') // location in parens
    .replace(/\s*-\s*[a-z\s,]+(?:CA|US|NY|TX|WA|BC|AB|ON)\s*$/i, '') // location after dash
    .replace(/\s*\(req\s*#?\d+\)\s*$/i, '') // req numbers
    .trim();
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
 * Recounts matches for an existing set of keywords against the current resume.
 * Keeps existing AI or heuristic metadata intact while updating live counts and scores.
 */
export function recountKeywordsForResume(
  analysis: JobAnalysisResult,
  resume: ResumeData
): JobAnalysisResult {
  const resumeFullText = getResumeFullText(resume);

  const updatedKeywords = analysis.keywords.map((k) => {
    const count = countKeywordOccurrences(resumeFullText, k.keyword);
    return {
      ...k,
      countInResume: count,
      matched: count > 0,
    };
  });

  const matchedCount = updatedKeywords.filter((k) => k.matched).length;
  const totalKeywords = updatedKeywords.length;

  let sweetSpotStatus: 'under' | 'optimal' | 'over' = 'optimal';
  let recommendation = '';

  if (matchedCount < 25) {
    sweetSpotStatus = 'under';
    recommendation = `Currently matching ${matchedCount} keywords. ATS requires 25–35 exact keywords to rank in top search results.`;
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

  return {
    ...analysis,
    keywords: updatedKeywords,
    totalKeywordsExtracted: totalKeywords,
    matchedCount,
    densityScore,
    sweetSpotStatus,
    recommendation,
  };
}

/**
 * Analyzes a job description against the resume.
 */
export function analyzeJobKeywords(
  jobDescription: string,
  resume: ResumeData
): JobAnalysisResult {
  const cleanedText = stripJobBoilerplate(jobDescription);
  const jobTextLower = cleanedText.toLowerCase();
  const resumeFullText = getResumeFullText(resume);
  const detectedTitle = extractJobTitle(cleanedText);

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
  while ((match = tokenRegex.exec(cleanedText)) !== null) {
    const candidate = match[1].trim();
    const candidateLower = candidate.toLowerCase();

    if (
      candidate.length >= 3 &&
      !STOPWORDS.has(candidateLower) &&
      !foundWords.has(candidateLower) &&
      matchedKeywords.length < 45
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

  // If Gemini provided a tailored summary, use it!
  if (jobAnalysis.tailoredSummary) {
    updated.summary = jobAnalysis.tailoredSummary;
  } else if (!updated.summary.toLowerCase().includes(updated.targetJobTitle.toLowerCase())) {
    // Upgraded heuristic summary: strictly 2 lines with \n
    updated.summary = `${updated.targetJobTitle} focused on physical products, human use, and material exploration.\nExperienced taking products from concept through rapid prototyping, electronics, and digital fabrication.`;
  }

  // If Gemini provided recommended skills, adapt categories cleanly
  if (jobAnalysis.recommendedSkills && jobAnalysis.recommendedSkills.length > 0) {
    // Preserve existing category structures while updating items
    const recMap = new Map(jobAnalysis.recommendedSkills.map((s) => [s.category.toLowerCase(), s.items]));

    updated.skills = updated.skills.map((category) => {
      const recItems = recMap.get(category.category.toLowerCase());
      if (recItems && recItems.length > 0) {
        return {
          category: category.category,
          items: recItems,
        };
      }
      return category;
    });

    return updated;
  }

  // Heuristic missing keywords injection
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
    /prototyp|print|fabricat|cut|machin|dfm|dfa|manufactur|cnc|toleran|mold|sheet\s*metal/i.test(k)
  );
  const cadSkills = keywordsToInject.filter((k) =>
    /rhino|cad|solidworks|revit|bim|parametric|surface|model|grasshopper|g&d|gd&t|keyshot/i.test(k)
  );
  const aiSkills = keywordsToInject.filter((k) =>
    /ai|comfy|diffusion|llm|python|generat|script|algorithm|vision/i.test(k)
  );
  const hardwareSkills = keywordsToInject.filter((k) =>
    /pcb|kicad|solder|circuit|ergonomics|keyboard|bom|electr|firmware|arduino|esp32/i.test(k)
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

  return updated;
}
