'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  FileText,
  RefreshCw,
  Plus,
  Layers,
} from 'lucide-react';
import { ResumeData, JobAnalysisResult, KeywordMatch } from '@/types/resume';
import { sampleJobs, SampleJob } from '@/data/sampleJobs';
import { analyzeJobKeywords, alignResumeWithJob } from '@/utils/keywordEngine';

interface JobPanelProps {
  resume: ResumeData;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  jobAnalysis: JobAnalysisResult;
}

export const JobPanel: React.FC<JobPanelProps> = ({
  resume,
  setResume,
  jobDescription,
  setJobDescription,
  jobAnalysis,
}) => {
  const [filter, setFilter] = useState<'all' | 'matched' | 'missing'>('all');
  const [isAligning, setIsAligning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle preset sample job selection
  const handleSelectSampleJob = (job: SampleJob) => {
    setJobDescription(job.description);
    // Auto-update title
    setResume((prev) => ({
      ...prev,
      targetJobTitle: job.title,
    }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJobDescription(content);
      }
    };
    reader.readAsText(file);
  };

  // One-click Auto-Align Resume
  const handleAutoAlign = () => {
    setIsAligning(true);
    setTimeout(() => {
      const updated = alignResumeWithJob(resume, jobAnalysis);
      setResume(updated);
      setIsAligning(false);
    }, 250);
  };

  // 1-Click add missing keyword to skills
  const handleAddKeywordToSkills = (keyword: string) => {
    setResume((prev) => {
      const newSkills = [...prev.skills];
      if (newSkills.length > 0) {
        // Add to first category or create one
        newSkills[0] = {
          ...newSkills[0],
          items: [...newSkills[0].items, keyword],
        };
      }
      return { ...prev, skills: newSkills };
    });
  };

  // Filtered keywords
  const filteredKeywords = jobAnalysis.keywords.filter((k) => {
    if (filter === 'matched') return k.matched;
    if (filter === 'missing') return !k.matched;
    return true;
  });

  const sweetSpotPercent = Math.min(
    100,
    Math.round((jobAnalysis.matchedCount / 35) * 100)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 overflow-y-auto">
      {/* Header section */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-zinc-700" />
            <h2 className="text-sm font-semibold text-zinc-900">Target Position Alignment</h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-medium">Step 1: Input Job</span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Paste the target job description or pick a preset. The engine extracts exact keywords
          to optimize your resume for the <strong className="text-zinc-900">25–35 sweet spot</strong>.
        </p>

        {/* Quick sample job buttons */}
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
            Quick Test Presets (Alex Li Background):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => handleSelectSampleJob(job)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                  resume.targetJobTitle.toLowerCase() === job.title.toLowerCase()
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-2xs'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {job.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Textarea & File Upload */}
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="job-desc" className="text-xs font-semibold text-zinc-800 flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            Job Description / Posting Text
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center text-[11px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <UploadCloud className="w-3 h-3 mr-1" />
              Upload file (.txt, .md)
            </button>
          </div>
        </div>

        <textarea
          id="job-desc"
          rows={7}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here (responsibilities, required skills, title)..."
          className="w-full text-xs font-mono text-zinc-800 p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
        />
      </div>

      {/* Target Job Title Match Banner (Rule 2: 10.6x callback rule) */}
      <div className="p-4 border-b border-zinc-200 bg-blue-50/50">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                Rule #2: 10.6x Callback Factor
              </span>
            </div>
            <p className="text-xs text-zinc-700">
              Header Target Title: <strong className="text-zinc-900 font-semibold">{resume.targetJobTitle}</strong>
            </p>
            {jobAnalysis.jobTitle && jobAnalysis.jobTitle.toLowerCase() !== resume.targetJobTitle.toLowerCase() && (
              <p className="text-[11px] text-amber-700 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 inline shrink-0" />
                Detected posting title: &quot;{jobAnalysis.jobTitle}&quot;
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (jobAnalysis.jobTitle) {
                setResume((prev) => ({ ...prev, targetJobTitle: jobAnalysis.jobTitle }));
              }
            }}
            className="shrink-0 text-xs px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-md font-medium shadow-2xs transition-colors"
          >
            Sync Exact Title
          </button>
        </div>
      </div>

      {/* Keyword Sweet Spot Gauge (Rule 4: 25-35 keywords) */}
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Keyword Density Sweet Spot
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  jobAnalysis.sweetSpotStatus === 'optimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : jobAnalysis.sweetSpotStatus === 'under'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {jobAnalysis.sweetSpotStatus === 'optimal'
                  ? 'Optimal (25–35)'
                  : jobAnalysis.sweetSpotStatus === 'under'
                  ? 'Under-Indexed (<25)'
                  : 'Stuffing Risk (>35)'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {jobAnalysis.matchedCount} of {jobAnalysis.totalKeywordsExtracted} posting keywords matched
            </p>
          </div>

          <button
            onClick={handleAutoAlign}
            disabled={isAligning}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {isAligning ? 'Aligning...' : 'Auto-Align Resume'}
          </button>
        </div>

        {/* Visual Progress Bar with sweet spot zones */}
        <div className="mt-2">
          <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            {/* Target 25-35 zone marker */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-100/70 border-x border-emerald-400/40"
              style={{ left: '71%', width: '28%' }}
              title="Sweet Spot: 25 to 35 keywords"
            />
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                jobAnalysis.sweetSpotStatus === 'optimal'
                  ? 'bg-emerald-600'
                  : jobAnalysis.sweetSpotStatus === 'under'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (jobAnalysis.matchedCount / 35) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-medium">
            <span>0</span>
            <span className="text-zinc-600 font-semibold">15</span>
            <span className="text-emerald-700 font-bold">25 (Minimum Pass)</span>
            <span className="text-emerald-700 font-bold">35 (Sweet Spot)</span>
            <span className="text-zinc-600">40+</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600 mt-2 bg-zinc-50 p-2 rounded-md border border-zinc-200/80 leading-relaxed">
          {jobAnalysis.recommendation}
        </p>
      </div>

      {/* Keyword Chip List */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-zinc-800">
            Extracted Keywords ({jobAnalysis.keywords.length})
          </h4>
          <div className="flex items-center space-x-1 bg-zinc-100 p-0.5 rounded-md text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === 'all'
                  ? 'bg-white text-zinc-900 font-semibold shadow-2xs'
                  : 'text-zinc-600'
              }`}
            >
              All ({jobAnalysis.keywords.length})
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === 'matched'
                  ? 'bg-white text-emerald-800 font-semibold shadow-2xs'
                  : 'text-zinc-600'
              }`}
            >
              Matched ({jobAnalysis.matchedCount})
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === 'missing'
                  ? 'bg-white text-zinc-900 font-semibold shadow-2xs'
                  : 'text-zinc-600'
              }`}
            >
              Missing ({jobAnalysis.keywords.length - jobAnalysis.matchedCount})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
          {filteredKeywords.map((k) => (
            <div
              key={k.keyword}
              className={`group inline-flex items-center text-xs px-2.5 py-1 rounded-md border transition-all ${
                k.matched
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {k.matched ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
              ) : (
                <button
                  onClick={() => handleAddKeywordToSkills(k.keyword)}
                  title="Click to add this keyword into Resume Skills"
                  className="hover:text-blue-600 transition-colors mr-1"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 shrink-0" />
                </button>
              )}
              <span className="font-medium">{k.keyword}</span>
              {k.matched && k.countInResume > 1 && (
                <span className="ml-1 text-[10px] px-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                  ×{k.countInResume}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
