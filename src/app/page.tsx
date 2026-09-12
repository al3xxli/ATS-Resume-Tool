'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { alexLiOriginalResume } from '@/data/defaultResume';
import { sampleJobs } from '@/data/sampleJobs';
import { analyzeJobKeywords } from '@/utils/keywordEngine';
import { runAtsAudit } from '@/utils/atsAudit';
import { generateAtsPlainText } from '@/utils/plaintextGenerator';
import { AllowedFont } from '@/utils/docxGenerator';
import { Header } from '@/components/Header';
import { JobPanel } from '@/components/JobPanel';
import { ResumePreview } from '@/components/ResumePreview';
import { ResumeEditor } from '@/components/ResumeEditor';
import { AtsAuditView } from '@/components/AtsAuditView';
import { Check } from 'lucide-react';

export default function Home() {
  const [resume, setResume] = useState<ResumeData>(() =>
    JSON.parse(JSON.stringify(alexLiOriginalResume))
  );
  const [jobDescription, setJobDescription] = useState<string>(
    () => sampleJobs[0].description
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'audit'>('preview');
  const [mobileView, setMobileView] = useState<'job' | 'resume'>('resume');
  const [fontFamily, setFontFamily] = useState<AllowedFont>('Calibri');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load saved state from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedResume = localStorage.getItem('ats_resume_data');
      if (savedResume) {
        const parsed = JSON.parse(savedResume);
        if (parsed && parsed.name) {
          setResume(parsed);
        }
      }

      const savedJob = localStorage.getItem('ats_job_description');
      if (savedJob) {
        setJobDescription(savedJob);
      }

      const savedFont = localStorage.getItem('ats_font_family');
      if (savedFont && ['Calibri', 'Arial', 'Times New Roman'].includes(savedFont)) {
        setFontFamily(savedFont as AllowedFont);
      }

      const savedTab = localStorage.getItem('ats_active_tab');
      if (savedTab && ['preview', 'editor', 'audit'].includes(savedTab)) {
        setActiveTab(savedTab as 'preview' | 'editor' | 'audit');
      }
    } catch (e) {
      console.error('Failed to load saved ATS progress:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persist resume changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('ats_resume_data', JSON.stringify(resume));
    } catch (e) {
      console.error('Failed to save resume:', e);
    }
  }, [resume, isLoaded]);

  // 3. Persist job description changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('ats_job_description', jobDescription);
    } catch (e) {
      console.error('Failed to save job description:', e);
    }
  }, [jobDescription, isLoaded]);

  // 4. Persist font family changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('ats_font_family', fontFamily);
    } catch (e) {
      console.error('Failed to save font family:', e);
    }
  }, [fontFamily, isLoaded]);

  // 5. Persist active tab to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('ats_active_tab', activeTab);
    } catch (e) {
      console.error('Failed to save active tab:', e);
    }
  }, [activeTab, isLoaded]);

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
        fontFamily={fontFamily}
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
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Panel: Target Job & Keyword Engine */}
        <aside
          className={`w-full lg:w-[380px] xl:w-[420px] h-full shrink-0 ${
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
            <ResumePreview
              resume={resume}
              jobAnalysis={jobAnalysis}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
            />
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
