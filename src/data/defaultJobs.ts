import { TrackedJob } from '@/types/jobTracker';
import { alexLiOriginalResume } from './defaultResume';
import { singleSampleJob } from './sampleJobs';

export const initialTrackedJobs: TrackedJob[] = [
  {
    id: 'job-sample-1',
    company: 'Humane Hardware Labs',
    jobTitle: 'Hardware Product Designer',
    status: 'to_apply',
    dateAdded: 'Sep 12, 2026',
    jobDescription: singleSampleJob.description,
    savedResume: {
      ...alexLiOriginalResume,
      targetJobTitle: 'HARDWARE PRODUCT DESIGNER',
    },
    matchedKeywordsCount: 28,
    notes: 'Prioritize physical prototyping and KiCAD keyboard experience.',
  },
  {
    id: 'job-sample-2',
    company: 'Studio Synthesis',
    jobTitle: 'Computational Design Specialist',
    status: 'applied',
    dateAdded: 'Sep 10, 2026',
    dateApplied: 'Sep 11, 2026',
    jobDescription: 'Title: Computational Design Specialist\nCompany: Studio Synthesis\nLooking for Grasshopper, Rhino, and Python automation lead.',
    savedResume: {
      ...alexLiOriginalResume,
      targetJobTitle: 'COMPUTATIONAL DESIGN SPECIALIST',
    },
    matchedKeywordsCount: 26,
    notes: 'Submitted via company portal. Waiting for response.',
  },
];
