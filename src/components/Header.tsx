'use client';

import React from 'react';
import { FileDown, Printer, Copy } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { downloadAtsDocx, AllowedFont } from '@/utils/docxGenerator';

interface HeaderProps {
  resume: ResumeData;
  atsScore: number;
  fontFamily: AllowedFont;
  onCopyPlaintext: () => void;
  onPrint: () => void;
  activeTab: 'preview' | 'editor' | 'audit';
  setActiveTab: (tab: 'preview' | 'editor' | 'audit') => void;
}

export const Header: React.FC<HeaderProps> = ({
  resume,
  atsScore,
  fontFamily,
  onCopyPlaintext,
  onPrint,
  activeTab,
  setActiveTab,
}) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadAtsDocx(resume, fontFamily);
    } catch (err) {
      console.error('Error downloading docx:', err);
      alert('Failed to generate .docx. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand / Title */}
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-sm tracking-tight text-black">
              ATS Optimizer
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              Single-Page ATS Master (.docx)
            </span>
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center bg-zinc-100 p-0.5 rounded text-xs font-medium">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Resume
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <span>ATS Checks</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-200 text-black">
                {atsScore}%
              </span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onCopyPlaintext}
              title="Copy plain text"
              className="hidden md:inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy Text
            </button>

            <button
              onClick={onPrint}
              title="Print"
              className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-black hover:bg-zinc-800 active:bg-zinc-900 rounded transition-colors shadow-2xs disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              {downloading ? 'Exporting...' : 'Download .docx'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
