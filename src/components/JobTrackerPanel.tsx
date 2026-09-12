'use client';

import React, { useState } from 'react';
import { TrackedJob, ApplicationStatus } from '@/types/jobTracker';
import { ResumeData, JobAnalysisResult } from '@/types/resume';
import { downloadAtsDocx, AllowedFont } from '@/utils/docxGenerator';
import {
  Briefcase,
  Trash2,
  Download,
  X,
  BookmarkPlus,
  ArrowUpDown,
  FileText,
  Check,
} from 'lucide-react';

interface JobTrackerPanelProps {
  jobs: TrackedJob[];
  setJobs: React.Dispatch<React.SetStateAction<TrackedJob[]>>;
  currentResume: ResumeData;
  setResume: (resume: ResumeData) => void;
  currentJobDescription: string;
  setJobDescription: (desc: string) => void;
  jobAnalysis: JobAnalysisResult;
  fontFamily: AllowedFont;
  onClose?: () => void;
  onShowToast: (msg: string) => void;
}

export const JobTrackerPanel: React.FC<JobTrackerPanelProps> = ({
  jobs,
  setJobs,
  currentResume,
  setResume,
  currentJobDescription,
  setJobDescription,
  jobAnalysis,
  fontFamily,
  onClose,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'to_apply' | 'applied' | 'interviewing'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'company' | 'status'>('date_desc');
  const [selectedJobIdToSave, setSelectedJobIdToSave] = useState<string>('');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');

  // Open inline save form
  const openSaveNewForm = () => {
    setNewCompany(jobAnalysis.company || '');
    setNewTitle(currentResume.targetJobTitle || jobAnalysis.jobTitle || 'Target Position');
    setIsSavingNew(true);
  };

  // Confirm save new job application
  const handleConfirmSaveNew = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const company = newCompany.trim() || 'Target Company';
    const title = newTitle.trim() || currentResume.targetJobTitle || 'Target Position';

    const newEntry: TrackedJob = {
      id: `job-${Date.now()}`,
      company,
      jobTitle: title,
      status: 'to_apply',
      dateAdded: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      jobDescription: currentJobDescription,
      savedResume: JSON.parse(JSON.stringify(currentResume)),
      matchedKeywordsCount: jobAnalysis.matchedCount,
    };

    setJobs((prev) => [newEntry, ...prev]);
    setIsSavingNew(false);
    setNewCompany('');
    setNewTitle('');
    onShowToast(`Saved current resume to new job application for "${company}"!`);
  };

  // Save current resume to an EXISTING selected job
  const handleSaveToExistingJob = (jobId: string) => {
    if (!jobId) return;
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            savedResume: JSON.parse(JSON.stringify(currentResume)),
            jobDescription: currentJobDescription,
            matchedKeywordsCount: jobAnalysis.matchedCount,
          };
        }
        return job;
      })
    );
    const targetJob = jobs.find((j) => j.id === jobId);
    onShowToast(`Updated saved resume for "${targetJob?.company || 'job'}"!`);
    setSelectedJobIdToSave('');
  };

  // Load a job's saved resume and description back into the editor
  const handleLoadJob = (job: TrackedJob) => {
    if (
      confirm(
        `Load the saved resume and job description for ${job.company} (${job.jobTitle}) into your workspace?`
      )
    ) {
      setResume(JSON.parse(JSON.stringify(job.savedResume)));
      if (job.jobDescription) {
        setJobDescription(job.jobDescription);
      }
      onShowToast(`Loaded resume used for ${job.company}!`);
    }
  };

  // Update status of a job
  const handleStatusChange = (jobId: string, status: ApplicationStatus) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updated = { ...job, status };
          if (status === 'applied' && !job.dateApplied) {
            updated.dateApplied = new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
          return updated;
        }
        return job;
      })
    );
  };

  // Delete a job
  const handleDeleteJob = (jobId: string, company: string) => {
    if (confirm(`Remove application tracking for ${company}?`)) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      onShowToast(`Removed ${company} from job tracker.`);
    }
  };

  // Download the exact saved resume for this job
  const handleDownloadSavedDocx = async (job: TrackedJob) => {
    try {
      const filename = `${job.company.replace(/[^a-zA-Z0-9]/g, '_')}_${job.jobTitle.replace(
        /[^a-zA-Z0-9]/g,
        '_'
      )}_resume.docx`;
      await downloadAtsDocx(job.savedResume, fontFamily, filename);
      onShowToast(`Downloaded .docx for ${job.company}`);
    } catch (e) {
      console.error(e);
      alert('Failed to download .docx');
    }
  };

  // Filter & Sort
  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    if (sortBy === 'date_asc') {
      return a.id.localeCompare(b.id);
    }
    // date_desc
    return b.id.localeCompare(a.id);
  });

  const toApplyCount = jobs.filter((j) => j.status === 'to_apply').length;
  const appliedCount = jobs.filter((j) => j.status === 'applied').length;
  const interviewingCount = jobs.filter((j) => j.status === 'interviewing').length;

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-4 h-4 text-black" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-black">
            Applications & Resumes
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-black">
            {jobs.length}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black rounded transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* "Save To" Action Box */}
      <div className="p-3.5 border-b border-zinc-200 bg-white space-y-2">
        <span className="text-[11px] font-bold text-black uppercase tracking-wider block">
          Save Current Resume
        </span>
        <p className="text-[11px] text-zinc-600 leading-tight">
          Snapshot the active resume & job description to track your application.
        </p>

        {isSavingNew ? (
          <form onSubmit={handleConfirmSaveNew} className="p-2.5 bg-zinc-50 border border-zinc-300 rounded space-y-2 mt-2">
            <div className="text-[11px] font-bold text-black flex items-center justify-between">
              <span>Save Resume Snapshot</span>
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="text-zinc-400 hover:text-black transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-0.5">
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp, Figma, Apple"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-300 rounded px-2 py-1 text-black focus:outline-hidden focus:border-black"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 font-semibold mb-0.5">
                Job Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hardware Product Designer"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs bg-white border border-zinc-300 rounded px-2 py-1 text-black focus:outline-hidden focus:border-black"
              />
            </div>
            <div className="flex items-center space-x-1.5 pt-1">
              <button
                type="submit"
                className="flex-1 text-xs py-1.5 px-2.5 bg-black text-white font-medium rounded hover:bg-zinc-800 transition-colors flex items-center justify-center space-x-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                <span>Save Application</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="text-xs py-1.5 px-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
            <button
              onClick={openSaveNewForm}
              className="flex-1 text-xs px-2.5 py-1.5 bg-black text-white rounded font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center space-x-1 shadow-2xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
              <span>Save to New Job</span>
            </button>

            {jobs.length > 0 && (
              <div className="flex-1 flex space-x-1">
                <select
                  value={selectedJobIdToSave}
                  onChange={(e) => setSelectedJobIdToSave(e.target.value)}
                  className="flex-1 text-[11px] bg-zinc-50 border border-zinc-300 rounded px-1.5 py-1 text-black truncate"
                >
                  <option value="">Save to existing...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.company} ({j.jobTitle})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveToExistingJob(selectedJobIdToSave)}
                  disabled={!selectedJobIdToSave}
                  className="text-xs px-2 py-1 bg-zinc-100 border border-zinc-300 rounded font-medium text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters & Sorting */}
      <div className="p-3 border-b border-zinc-200 bg-zinc-50/70 space-y-2">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'all'
                ? 'bg-black text-white font-medium'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-black'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('to_apply')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'to_apply'
                ? 'bg-black text-white font-medium'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-black'
            }`}
          >
            To Apply ({toApplyCount})
          </button>
          <button
            onClick={() => setFilter('applied')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'applied'
                ? 'bg-black text-white font-medium'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-black'
            }`}
          >
            Applied ({appliedCount})
          </button>
          <button
            onClick={() => setFilter('interviewing')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filter === 'interviewing'
                ? 'bg-black text-white font-medium'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-black'
            }`}
          >
            Interview ({interviewingCount})
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center justify-between text-[11px] text-zinc-600 pt-1">
          <span className="flex items-center">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-[11px] bg-white border border-zinc-300 rounded px-1.5 py-0.5 text-black"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="company">Company (A-Z)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
        {sortedJobs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="font-medium text-black">No applications here yet</p>
            <p className="text-[11px] mt-0.5">Click &apos;Save to New Job&apos; to track a role.</p>
          </div>
        ) : (
          sortedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-zinc-200 rounded p-3 shadow-2xs space-y-2 hover:border-zinc-300 transition-all"
            >
              {/* Card Header: Company & Title */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h4 className="text-xs font-bold text-black leading-tight">{job.company}</h4>
                  <p className="text-[11px] text-zinc-600 font-medium leading-tight mt-0.5">
                    {job.jobTitle}
                  </p>
                </div>

                {/* Status Dropdown */}
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job.id, e.target.value as ApplicationStatus)}
                  className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border cursor-pointer ${
                    job.status === 'applied'
                      ? 'bg-zinc-100 text-black border-zinc-400'
                      : job.status === 'interviewing'
                      ? 'bg-black text-white border-black'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                  }`}
                >
                  <option value="to_apply">To Apply</option>
                  <option value="applied">Applied (Waiting)</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Resume & Dates Metadata */}
              <div className="text-[10.5px] text-zinc-500 flex items-center justify-between border-t border-zinc-100 pt-1.5">
                <span className="flex items-center truncate max-w-[180px]">
                  <FileText className="w-3 h-3 mr-1 text-zinc-400 shrink-0" />
                  <span className="truncate">
                    {job.savedResume.targetJobTitle || 'Saved Resume'}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px]">
                  {job.status === 'applied' && job.dateApplied
                    ? `Applied: ${job.dateApplied}`
                    : `Added: ${job.dateAdded}`}
                </span>
              </div>

              {/* Action Buttons for this job */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleLoadJob(job)}
                    className="text-[11px] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-black font-medium rounded transition-colors"
                    title="Load this resume & job posting into editor"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDownloadSavedDocx(job)}
                    className="text-[11px] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-black font-medium rounded transition-colors flex items-center"
                    title="Download the .docx for this application"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    .docx
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteJob(job.id, job.company)}
                  className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                  title="Delete application"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
