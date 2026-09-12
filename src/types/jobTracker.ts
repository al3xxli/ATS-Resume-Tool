import { ResumeData } from './resume';

export type ApplicationStatus = 'to_apply' | 'applied' | 'interviewing' | 'archived';

export interface TrackedJob {
  id: string;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  dateAdded: string;
  dateApplied?: string;
  jobDescription: string;
  savedResume: ResumeData;
  matchedKeywordsCount?: number;
  notes?: string;
}
