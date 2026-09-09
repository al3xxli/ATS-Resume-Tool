'use client';

import React from 'react';
import { FileDown, Sparkles, CheckCircle2, ShieldCheck, Printer, Copy } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { downloadAtsDocx } from '@/utils/docxGenerator';

interface HeaderProps {
  resume: ResumeData;
  atsScore: number;
  onCopyPlaintext: () => void;
  onPrint: () => void;
  activeTab: 'preview' | 'editor' | 'audit';
  setActiveTab: (tab: 'preview' | 'editor' | 'audit') => void;
}

export const Header: React.FC<HeaderProps> = ({
  resume,
  atsScore,
  onCopyPlaintext,
  onPrint,
  activeTab,
  setActiveTab,
}) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadAtsDocx(resume);
    } catch (err) {
      console.error('Error downloading docx:', err);
      alert('Failed to generate .docx. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ATS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-zinc-900 tracking-tight">
                  ATS Resume Optimizer
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  10.6x Callback Rule
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Engineered for Workday, Greenhouse, Lever, iCIMS & Taleo
              </p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center bg-zinc-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ATS Resume
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Live Editor
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>ATS Audit</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  atsScore >= 90
                    ? 'bg-emerald-100 text-emerald-800'
                    : atsScore >= 75
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {atsScore}%
              </span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onCopyPlaintext}
              title="Copy plain text for job application forms"
              className="hidden md:inline-flex items-center px-2.5 py-1.5 border border-zinc-200 text-xs font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              Copy Text
            </button>

            <button
              onClick={onPrint}
              title="Print or save as clean PDF"
              className="hidden sm:inline-flex items-center px-2.5 py-1.5 border border-zinc-200 text-xs font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-zinc-500" />
              Print
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 mr-1.5" />
              {downloading ? 'Exporting...' : 'Download .docx'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
