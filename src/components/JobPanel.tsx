'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  Check,
  Plus,
  Briefcase,
  FileText,
} from 'lucide-react';
import { ResumeData, JobAnalysisResult } from '@/types/resume';
import { singleSampleJob } from '@/data/sampleJobs';
import { alignResumeWithJob } from '@/utils/keywordEngine';

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

  // Load single sample job
  const handleLoadSample = () => {
    setJobDescription(singleSampleJob.description);
    setResume((prev) => ({
      ...prev,
      targetJobTitle: singleSampleJob.title,
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

  // Auto-Align Resume
  const handleAutoAlign = () => {
    setIsAligning(true);
    setTimeout(() => {
      const updated = alignResumeWithJob(resume, jobAnalysis);
      setResume(updated);
      setIsAligning(false);
    }, 200);
  };

  // Add keyword to skills
  const handleAddKeywordToSkills = (keyword: string) => {
    setResume((prev) => {
      const newSkills = [...prev.skills];
      if (newSkills.length > 0) {
        newSkills[0] = {
          ...newSkills[0],
          items: [...newSkills[0].items, keyword],
        };
      }
      return { ...prev, skills: newSkills };
    });
  };

  const filteredKeywords = jobAnalysis.keywords.filter((k) => {
    if (filter === 'matched') return k.matched;
    if (filter === 'missing') return !k.matched;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 overflow-y-auto">
      {/* Top Header & Single Sample Job Button */}
      <div className="p-4 border-b border-zinc-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-black" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              Target Position & Keywords
            </h2>
          </div>
          <button
            onClick={handleLoadSample}
            className="text-[11px] px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-black rounded font-medium transition-colors"
          >
            Load Sample Job
          </button>
        </div>

        <p className="text-xs text-zinc-600 leading-normal">
          Paste the job posting below. The engine extracts exact keywords to target the{' '}
          <strong className="text-black">25–35 sweet spot</strong> and syncs the exact job title.
        </p>
      </div>

      {/* Job Description Textarea */}
      <div className="p-4 border-b border-zinc-200 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="job-input" className="text-xs font-semibold text-black flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1 text-zinc-700" />
            Job Posting Description
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.text"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-zinc-600 hover:text-black font-medium flex items-center"
          >
            <UploadCloud className="w-3 h-3 mr-1" />
            Upload file (.txt)
          </button>
        </div>

        <textarea
          id="job-input"
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          className="w-full text-xs font-mono text-black p-2.5 bg-zinc-50 border border-zinc-300 rounded focus:outline-none focus:border-black transition-all resize-y"
        />
      </div>

      {/* Target Title Match */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            Target Job Title (10.6x Callback Rule)
          </span>
          <span className="text-xs font-bold text-black">{resume.targetJobTitle}</span>
        </div>

        {jobAnalysis.jobTitle && jobAnalysis.jobTitle.toLowerCase() !== resume.targetJobTitle.toLowerCase() && (
          <button
            onClick={() =>
              setResume((prev) => ({ ...prev, targetJobTitle: jobAnalysis.jobTitle }))
            }
            className="text-xs px-2.5 py-1 bg-black text-white rounded font-medium hover:bg-zinc-800 transition-colors"
          >
            Sync Title
          </button>
        )}
      </div>

      {/* Keyword Sweet Spot Summary */}
      <div className="p-4 border-b border-zinc-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-black">
              Keywords: {jobAnalysis.matchedCount} / {jobAnalysis.totalKeywordsExtracted}
            </span>
            <span className="text-[11px] text-zinc-600 block">
              {jobAnalysis.sweetSpotStatus === 'optimal'
                ? 'Inside 25–35 Sweet Spot'
                : jobAnalysis.sweetSpotStatus === 'under'
                ? 'Under-indexed (<25 keywords)'
                : 'Stuffing risk (>35 keywords)'}
            </span>
          </div>

          <button
            onClick={handleAutoAlign}
            disabled={isAligning}
            className="text-xs px-3 py-1.5 bg-black text-white font-semibold rounded hover:bg-zinc-800 active:bg-zinc-900 transition-colors disabled:opacity-50 flex items-center"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {isAligning ? 'Aligning...' : 'Auto-Align'}
          </button>
        </div>

        {/* Minimalist Progress Meter */}
        <div className="relative h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (jobAnalysis.matchedCount / 35) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>0</span>
          <span>Target: 25–35</span>
          <span>40+</span>
        </div>
      </div>

      {/* Keyword Chips List */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-black">
            Keywords ({jobAnalysis.keywords.length})
          </span>
          <div className="flex space-x-1 text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded ${
                filter === 'all' ? 'bg-black text-white font-medium' : 'text-zinc-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-2 py-0.5 rounded ${
                filter === 'matched' ? 'bg-black text-white font-medium' : 'text-zinc-600 hover:text-black'
              }`}
            >
              Matched ({jobAnalysis.matchedCount})
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-2 py-0.5 rounded ${
                filter === 'missing' ? 'bg-black text-white font-medium' : 'text-zinc-600 hover:text-black'
              }`}
            >
              Missing
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto">
          {filteredKeywords.map((k) => (
            <span
              key={k.keyword}
              className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded border ${
                k.matched
                  ? 'bg-zinc-100 border-zinc-300 text-black font-medium'
                  : 'bg-white border-zinc-200 text-zinc-500'
              }`}
            >
              {k.matched ? (
                <Check className="w-3 h-3 mr-1 text-black shrink-0" />
              ) : (
                <button
                  onClick={() => handleAddKeywordToSkills(k.keyword)}
                  title="Add to skills"
                  className="mr-1 hover:text-black"
                >
                  <Plus className="w-3 h-3 text-zinc-400 hover:text-black" />
                </button>
              )}
              <span>{k.keyword}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
