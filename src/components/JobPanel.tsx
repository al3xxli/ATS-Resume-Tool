'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  UploadCloud,
  Check,
  Plus,
  Briefcase,
  FileText,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Loader2,
  Wand2,
  Info,
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
  onAiAlignSuccess?: (result: JobAnalysisResult) => void;
  onShowToast?: (msg: string) => void;
}

export const JobPanel: React.FC<JobPanelProps> = ({
  resume,
  setResume,
  jobDescription,
  setJobDescription,
  jobAnalysis,
  onAiAlignSuccess,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'matched' | 'missing'>('all');
  const [isAiAligning, setIsAiAligning] = useState(false);
  const [isHeuristicAligning, setIsHeuristicAligning] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempKey, setTempKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('ats_gemini_api_key');
      if (savedKey) {
        setApiKey(savedKey);
        setTempKey(savedKey);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Load single sample job
  const handleLoadSample = () => {
    setJobDescription(singleSampleJob.description);
    setResume((prev) => ({
      ...prev,
      targetJobTitle: singleSampleJob.title,
    }));
    if (onShowToast) onShowToast('Loaded sample job posting.');
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
        if (onShowToast) onShowToast(`Uploaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Offline Heuristic Auto-Align Resume
  const handleHeuristicAlign = () => {
    setIsHeuristicAligning(true);
    setTimeout(() => {
      const updated = alignResumeWithJob(resume, jobAnalysis);
      setResume(updated);
      setIsHeuristicAligning(false);
      setAiError(null);
      if (onShowToast) onShowToast('Offline heuristic alignment applied.');
    }, 150);
  };

  // Gemini AI Auto-Align Resume
  const handleAiAlign = async (overrideKey?: string) => {
    if (!jobDescription.trim()) {
      if (onShowToast) onShowToast('Please paste a job description first.');
      return;
    }

    const keyToUse = overrideKey !== undefined ? overrideKey.trim() : apiKey.trim();
    setIsAiAligning(true);
    setAiError(null);

    try {
      const res = await fetch('/api/align', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          currentResume: resume,
          clientApiKey: keyToUse || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'MISSING_API_KEY') {
          setShowKeyModal(true);
          setAiError('Please enter your Google AI Studio API key to enable Gemini AI, or run offline heuristic.');
        } else {
          setAiError(data.error || 'Failed to align with Gemini AI.');
        }
        return;
      }

      // Success: Apply tailored updates to resume
      setResume((prev) => ({
        ...prev,
        targetJobTitle: data.jobTitle || prev.targetJobTitle,
        summary: data.tailoredSummary || prev.summary,
        skills:
          data.recommendedSkills && data.recommendedSkills.length > 0
            ? data.recommendedSkills
            : prev.skills,
      }));

      // Pass rich analysis to parent
      if (onAiAlignSuccess) {
        onAiAlignSuccess({
          ...data,
          isAiGenerated: true,
        });
      }

      setShowKeyModal(false);
      if (onShowToast) {
        onShowToast(
          `Gemini AI: Extracted "${data.jobTitle}" & tailored 2-line summary inside 25–35 sweet spot!`
        );
      }
    } catch (err: any) {
      console.error('Gemini Alignment Error:', err);
      setAiError(err?.message || 'Network error communicating with alignment service.');
    } finally {
      setIsAiAligning(false);
    }
  };

  // Save API Key to localStorage & trigger AI alignment
  const handleSaveKeyAndAlign = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = tempKey.trim();
    try {
      if (cleanKey) {
        localStorage.setItem('ats_gemini_api_key', cleanKey);
        setApiKey(cleanKey);
      } else {
        localStorage.removeItem('ats_gemini_api_key');
        setApiKey('');
      }
    } catch {
      // Ignore localStorage write error
    }
    handleAiAlign(cleanKey);
  };

  // Clear stored key
  const handleClearKey = () => {
    try {
      localStorage.removeItem('ats_gemini_api_key');
    } catch {}
    setApiKey('');
    setTempKey('');
    setAiError(null);
    if (onShowToast) onShowToast('Stored API key removed.');
  };

  // Add keyword to skills manually
  const handleAddKeywordToSkills = (keyword: string) => {
    setResume((prev) => {
      const newSkills = [...prev.skills];
      if (newSkills.length > 0) {
        // Prevent duplicate
        if (!newSkills[0].items.includes(keyword)) {
          newSkills[0] = {
            ...newSkills[0],
            items: [...newSkills[0].items, keyword],
          };
        }
      }
      return { ...prev, skills: newSkills };
    });
    if (onShowToast) onShowToast(`Added "${keyword}" to skills`);
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
          Paste any job posting (LinkedIn, Greenhouse, Lever, Workday). The engine strips
          boilerplate, extracts exact keywords for the{' '}
          <strong className="text-black">25–35 sweet spot</strong>, and syncs the exact title.
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
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste full job posting text here..."
          className="w-full text-xs font-mono text-black p-2.5 bg-zinc-50 border border-zinc-300 rounded focus:outline-none focus:border-black transition-all resize-y"
        />
      </div>

      {/* Target Title & Company Match */}
      <div className="p-3.5 border-b border-zinc-200 bg-zinc-50 space-y-1.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Target Job Title (Rule #2: 10.6x Callback)
            </span>
            <div className="flex items-baseline space-x-1.5 flex-wrap">
              <span className="text-xs font-bold text-black">{resume.targetJobTitle}</span>
              {jobAnalysis.company && (
                <span className="text-[11px] text-zinc-600 font-medium">
                  @ {jobAnalysis.company}
                </span>
              )}
              {jobAnalysis.isAiGenerated && (
                <span className="inline-flex items-center text-[9px] bg-zinc-200 text-black px-1.5 py-0.5 rounded font-mono font-medium">
                  Gemini AI
                </span>
              )}
            </div>
          </div>

          {jobAnalysis.jobTitle &&
            jobAnalysis.jobTitle.toLowerCase() !== resume.targetJobTitle.toLowerCase() && (
              <button
                onClick={() =>
                  setResume((prev) => ({ ...prev, targetJobTitle: jobAnalysis.jobTitle }))
                }
                className="text-xs px-2.5 py-1 bg-black text-white rounded font-medium hover:bg-zinc-800 transition-colors shrink-0"
              >
                Sync Title
              </button>
            )}
        </div>

        {/* AI Rationale Dropdown if present */}
        {jobAnalysis.rationale && (
          <div className="pt-1">
            <button
              onClick={() => setShowRationale((prev) => !prev)}
              className="text-[10px] text-zinc-500 hover:text-black flex items-center font-medium"
            >
              <Info className="w-3 h-3 mr-1" />
              {showRationale ? 'Hide AI Alignment Rationale' : 'View AI Alignment Rationale'}
            </button>
            {showRationale && (
              <p className="text-[11px] text-zinc-700 bg-white p-2 rounded border border-zinc-200 mt-1 leading-relaxed">
                {jobAnalysis.rationale}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Auto-Align Actions & Keyword Sweet Spot Summary */}
      <div className="p-4 border-b border-zinc-200 space-y-3">
        {/* Alignment Action Buttons */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAiAlign()}
              disabled={isAiAligning || !jobDescription.trim()}
              className="flex-1 py-2 px-3 bg-black hover:bg-zinc-800 text-white font-semibold rounded text-xs transition-colors disabled:opacity-50 flex items-center justify-center shadow-xs"
              title="Align format-agnostically with Gemini AI"
            >
              {isAiAligning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-zinc-300" />
                  <span>Aligning with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-zinc-200" />
                  <span>AI Auto-Align (Gemini)</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setTempKey(apiKey);
                setShowKeyModal(true);
                setAiError(null);
              }}
              className={`p-2 rounded border transition-colors ${
                apiKey
                  ? 'border-zinc-400 bg-zinc-100 text-black hover:bg-zinc-200'
                  : 'border-zinc-300 text-zinc-600 hover:text-black hover:border-black'
              }`}
              title="Configure Gemini API Key"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] px-0.5">
            <button
              onClick={handleHeuristicAlign}
              disabled={isHeuristicAligning || !jobDescription.trim()}
              className="text-zinc-500 hover:text-black transition-colors flex items-center font-medium underline underline-offset-2"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              {isHeuristicAligning ? 'Running...' : 'Run Offline Heuristic'}
            </button>

            {apiKey ? (
              <span className="text-[10px] text-zinc-500 font-mono flex items-center">
                <Check className="w-3 h-3 mr-0.5 text-black" /> Key Saved
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-mono">No Key (Fallback)</span>
            )}
          </div>
        </div>

        {/* Inline Error if AI Alignment fails with instant offline option */}
        {aiError && (
          <div className="p-3 bg-zinc-50 border border-zinc-300 rounded text-[11px] text-zinc-800 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                <span className="font-semibold text-black">Gemini AI Notice</span>
              </div>
              <button onClick={() => setAiError(null)} className="text-zinc-400 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-zinc-700 leading-relaxed">{aiError}</p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleHeuristicAlign}
                className="px-2.5 py-1 bg-black text-white font-medium rounded text-[11px] hover:bg-zinc-800 transition-colors flex items-center"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Run Offline Heuristic
              </button>
              <button
                onClick={() => setShowKeyModal(true)}
                className="px-2.5 py-1 border border-zinc-300 bg-white text-black font-medium rounded text-[11px] hover:bg-zinc-100 transition-colors"
              >
                Configure API Key
              </button>
            </div>
          </div>
        )}

        {/* Progress & Sweet Spot Meter */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black">
              Keywords: {jobAnalysis.matchedCount} / {jobAnalysis.totalKeywordsExtracted}
            </span>
            <span
              className={`text-[11px] font-medium ${
                jobAnalysis.sweetSpotStatus === 'optimal'
                  ? 'text-black'
                  : 'text-zinc-600'
              }`}
            >
              {jobAnalysis.sweetSpotStatus === 'optimal'
                ? 'Inside 25–35 Sweet Spot'
                : jobAnalysis.sweetSpotStatus === 'under'
                ? 'Under-indexed (<25 keywords)'
                : 'Stuffing risk (>35 keywords)'}
            </span>
          </div>

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
                filter === 'all'
                  ? 'bg-black text-white font-medium'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-2 py-0.5 rounded ${
                filter === 'matched'
                  ? 'bg-black text-white font-medium'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Matched ({jobAnalysis.matchedCount})
            </button>
            <button
              onClick={() => setFilter('missing')}
              className={`px-2 py-0.5 rounded ${
                filter === 'missing'
                  ? 'bg-black text-white font-medium'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Missing
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
          {filteredKeywords.map((k) => (
            <span
              key={k.keyword}
              className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded border transition-colors ${
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

      {/* Gemini AI Settings Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-zinc-300 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-black" />
                <h3 className="text-sm font-bold text-black">Google Gemini AI Alignment</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Format-agnostic job extraction dynamically queries Google Gemini (<code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-[11px]">gemini-2.0-flash</code> / <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-[11px]">gemini-1.5-flash</code>) to strip boilerplate (EEO, benefits, pay ranges) and tailor the 2-line summary to the exact target job title.
            </p>

            <form onSubmit={handleSaveKeyAndAlign} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Google AI Studio API Key (Free)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs font-mono p-2 pr-9 border border-zinc-300 rounded focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Keys are stored locally in your browser (<code className="font-mono">localStorage</code>) and never logged.
                </span>
              </div>

              <div className="pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-black font-medium underline flex items-center hover:text-zinc-700"
                >
                  Get free API key from Google AI Studio
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                <div>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="text-xs text-zinc-500 hover:text-black font-medium"
                    >
                      Clear Key
                    </button>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowKeyModal(false);
                      handleHeuristicAlign();
                    }}
                    className="text-xs px-3 py-1.5 border border-zinc-300 rounded font-medium hover:bg-zinc-100 transition-colors"
                  >
                    Use Offline Heuristic
                  </button>

                  <button
                    type="submit"
                    disabled={isAiAligning}
                    className="text-xs px-3.5 py-1.5 bg-black text-white font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center"
                  >
                    {isAiAligning ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Aligning...
                      </>
                    ) : (
                      'Save & Align'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
