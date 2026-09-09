'use client';

import React from 'react';
import { ResumeData, AuditCheckItem } from '@/types/resume';
import { runAtsAudit } from '@/utils/atsAudit';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  FileX2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface AtsAuditViewProps {
  resume: ResumeData;
  matchedCount: number;
}

export const AtsAuditView: React.FC<AtsAuditViewProps> = ({
  resume,
  matchedCount,
}) => {
  const audit = runAtsAudit(resume, resume.targetJobTitle, matchedCount);

  return (
    <div className="flex flex-col h-full bg-zinc-50 overflow-y-auto p-6 space-y-6">
      {/* Top Banner: Before vs After ATS Score Card */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Visual & Structural Forensic Analysis
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Alex Li Resume Audit
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mt-2">
              ATS Compliance & Diagnostic Report
            </h2>
            <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
              Based on real ATS testing across Workday, Greenhouse, Lever, iCIMS, and Taleo.
              Here is how Alex Li&apos;s original PDF fails automated parsing vs how this webapp resolves it.
            </p>
          </div>

          {/* Scores Comparison Box */}
          <div className="flex items-center space-x-4 shrink-0 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
            {/* Before Score */}
            <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center space-x-1 text-red-700">
                <FileX2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Original PDF</span>
              </div>
              <div className="text-2xl font-black text-red-600 mt-0.5">42<span className="text-sm font-normal text-red-400">/100</span></div>
              <div className="text-[10px] text-red-700 font-medium">Invisible in Searches</div>
            </div>

            <ArrowRight className="w-5 h-5 text-zinc-400" />

            {/* After Score */}
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-center space-x-1 text-emerald-700">
                <FileCheck2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">ATS Webapp</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">{audit.overallScore}<span className="text-sm font-normal text-emerald-400">/100</span></div>
              <div className="text-[10px] text-emerald-700 font-semibold">10.6x Callbacks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Findings Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center">
          <TrendingUp className="w-4 h-4 mr-1.5 text-blue-600" />
          ATS Diagnostic Checks & Fixes
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {audit.checks.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-3 transition-all hover:border-zinc-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 rounded-full">
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : item.status === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-700">
                        Rule #{item.ruleNumber}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.guideline}</p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                  {item.impact}
                </span>
              </div>

              {/* Before vs After comparison grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                {/* PDF Problem */}
                <div className="p-3 rounded-lg bg-red-50/60 border border-red-200 text-red-900 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-red-700 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>Original PDF Failure</span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed font-mono text-[11px]">
                    {item.originalPdfIssue}
                  </p>
                </div>

                {/* ATS Fix */}
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>ATS Webapp Fix</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                    {item.atsFix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why .docx & Single-Column Matters Note */}
      <div className="bg-zinc-900 text-white p-5 rounded-xl text-xs space-y-2">
        <h4 className="font-bold text-sm text-zinc-100 flex items-center">
          <HelpCircle className="w-4 h-4 mr-1.5 text-blue-400" />
          Why This WebApp Exports to Native .docx by Default
        </h4>
        <p className="text-zinc-300 leading-relaxed">
          While modern ATS systems can read text-based PDFs, PDFs remain prone to font encoding errors,
          two-column OCR scrambling, and unicode ligature corruptions. Microsoft Word .docx is parsed natively
          by 100% of tested enterprise systems (Workday, Greenhouse, Lever, Taleo, iCIMS) without OCR loss.
          Use the <strong className="text-white">Download .docx</strong> button to obtain the master ATS-safe file.
        </p>
      </div>
    </div>
  );
};
