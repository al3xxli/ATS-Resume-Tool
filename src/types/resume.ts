export interface ContactInfo {
  phone: string;
  email: string;
  linkedin: string;
  portfolio: string;
  location?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  dateRange: string;
  details: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  dateRange: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  awards?: string;
  dateRange: string;
  highlights: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ResumeData {
  name: string;
  targetJobTitle: string;
  summary: string;
  contact: ContactInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  languages: string[];
  sectionOrder?: 'projects_first' | 'experience_first';
}

export interface KeywordMatch {
  keyword: string;
  category: 'technical' | 'tool' | 'methodology' | 'domain';
  countInResume: number;
  inJobDescription: boolean;
  matched: boolean;
}

export interface JobAnalysisResult {
  jobTitle: string;
  company?: string;
  totalKeywordsExtracted: number;
  keywords: KeywordMatch[];
  matchedCount: number;
  densityScore: number; // 0-100
  sweetSpotStatus: 'under' | 'optimal' | 'over'; // <25: under, 25-35: optimal, >35: over
  recommendation: string;
  tailoredSummary?: string;
  recommendedSkills?: SkillCategory[];
  rationale?: string;
  isAiGenerated?: boolean;
}

export interface AuditCheckItem {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'warning';
  ruleNumber: number;
  guideline: string;
  originalPdfIssue: string;
  atsFix: string;
  impact: string;
}
