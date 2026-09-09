'use client';

import React, { useState, useMemo } from 'react';
import { ResumeData } from '@/types/resume';
import { alexLiOriginalResume } from '@/data/defaultResume';
import { sampleJobs } from '@/data/sampleJobs';
import { analyzeJobKeywords } from '@/utils/keywordEngine';
import { runAtsAudit } from '@/utils/atsAudit';
import { generateAtsPlainText } from '@/utils/plaintextGenerator';
import { Header } from '@/components/Header';
import { JobPanel } from '@/components/JobPanel';
import { ResumePreview } from '@/components/ResumePreview';
import { ResumeEditor } from '@/components/ResumeEditor';
import { AtsAuditView } from '@/components/AtsAuditView';
import { Check, Info, Briefcase, Eye, Sliders, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [resume, setResume] = useState<ResumeData>(() =>
    JSON.parse(JSON.stringify(alexLiOriginalResume))
  );
  const [jobDescription, setJobDescription] = useState<string>(
    () => sampleJobs[0].description
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'audit'>('preview');
  const [mobileView, setMobileView] = useState<'job' | 'resume'>('resume');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Analyze keywords dynamically
  const jobAnalysis = useMemo(() => {
    return analyzeJobKeywords(jobDescription, resume);
  }, [jobDescription, resume]);

  // Run ATS audit dynamically
  const auditResult = useMemo(() => {
    return runAtsAudit(resume, resume.targetJobTitle, jobAnalysis.matchedCount);
  }, [resume, jobAnalysis.matchedCount]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Copy plain text to clipboard
  const handleCopyPlaintext = async () => {
    try {
      const text = generateAtsPlainText(resume);
      await navigator.clipboard.writeText(text);
      showToast('ATS Plaintext copied to clipboard! Ready to paste into application forms.');
    } catch (err) {
      showToast('Could not copy to clipboard. Please allow clipboard permissions.');
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 border border-zinc-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Header
        resume={resume}
        atsScore={auditResult.overallScore}
        onCopyPlaintext={handleCopyPlaintext}
        onPrint={handlePrint}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Mobile view switcher */}
      <div className="lg:hidden bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between">
        <div className="flex bg-zinc-100 p-1 rounded-lg text-xs w-full">
          <button
            onClick={() => setMobileView('job')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
              mobileView === 'job'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600'
            }`}
          >
            Job & Keywords ({jobAnalysis.matchedCount})
          </button>
          <button
            onClick={() => setMobileView('resume')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
              mobileView === 'resume'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600'
            }`}
          >
            Resume & Audit
          </button>
        </div>
      </div>

      {/* Main Dual Panel Layout */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Panel: Target Job & Keyword Engine */}
        <aside
          className={`w-full lg:w-[420px] xl:w-[460px] h-full shrink-0 ${
            mobileView === 'job' ? 'block' : 'hidden lg:block'
          }`}
        >
          <JobPanel
            resume={resume}
            setResume={setResume}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            jobAnalysis={jobAnalysis}
          />
        </aside>

        {/* Right Panel: Live Resume Preview / Editor / Forensic Audit */}
        <section
          className={`flex-1 h-full overflow-hidden ${
            mobileView === 'resume' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activeTab === 'preview' && (
            <ResumePreview resume={resume} jobAnalysis={jobAnalysis} />
          )}
          {activeTab === 'editor' && (
            <ResumeEditor resume={resume} setResume={setResume} />
          )}
          {activeTab === 'audit' && (
            <AtsAuditView resume={resume} matchedCount={jobAnalysis.matchedCount} />
          )}
        </section>
      </main>
    </div>
  );
}
