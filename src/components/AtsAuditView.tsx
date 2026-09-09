'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
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
      <div className="bg-white p-5 rounded border border-zinc-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Audit Report • Alex Li Resume
            </span>
            <h2 className="text-base font-bold text-black mt-1">
              ATS Compliance Diagnostic
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5 max-w-xl leading-normal">
              Based on ATS testing across Workday, Greenhouse, Lever, iCIMS, and Taleo.
              Here is how Alex Li&apos;s original PDF failed automated parsing vs how this webapp resolves it.
            </p>
          </div>

          {/* Scores Comparison Box */}
          <div className="flex items-center space-x-3 shrink-0 bg-zinc-50 p-2.5 rounded border border-zinc-200">
            {/* Before Score */}
            <div className="text-center px-3 py-1.5 bg-white rounded border border-zinc-300">
              <div className="flex items-center justify-center space-x-1 text-zinc-700">
                <FileX2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Original PDF</span>
              </div>
              <div className="text-xl font-bold text-black mt-0.5">42<span className="text-xs font-normal text-zinc-500">/100</span></div>
              <div className="text-[10px] text-zinc-500">Invisible to Search</div>
            </div>

            <ArrowRight className="w-4 h-4 text-zinc-400" />

            {/* After Score */}
            <div className="text-center px-3 py-1.5 bg-black text-white rounded border border-black">
              <div className="flex items-center justify-center space-x-1 text-zinc-300">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">ATS Webapp</span>
              </div>
              <div className="text-xl font-bold text-white mt-0.5">{audit.overallScore}<span className="text-xs font-normal text-zinc-400">/100</span></div>
              <div className="text-[10px] text-zinc-300">10.6x Callbacks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Findings Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
          <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-black" />
          ATS Diagnostic Checks & Fixes
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {audit.checks.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded border border-zinc-200 p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div>
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-black" />
                    ) : item.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-zinc-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-800" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-black">
                        Rule #{item.ruleNumber}
                      </span>
                      <h4 className="text-xs font-bold text-black">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{item.guideline}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-black border border-zinc-200 shrink-0">
                  {item.impact}
                </span>
              </div>

              {/* Before vs After comparison grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {/* PDF Problem */}
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-black space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Original PDF Failure
                  </div>
                  <p className="text-[11px] text-zinc-800 leading-relaxed font-mono">
                    {item.originalPdfIssue}
                  </p>
                </div>

                {/* ATS Fix */}
                <div className="p-2.5 rounded bg-zinc-50 border border-zinc-300 text-black space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black">
                    ATS Webapp Fix
                  </div>
                  <p className="text-[11px] text-black leading-relaxed font-sans">
                    {item.atsFix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-black text-white p-4 rounded text-xs space-y-1.5">
        <h4 className="font-bold text-xs text-white flex items-center">
          <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-white" />
          Why Native .docx & Single-Page Flow Matter
        </h4>
        <p className="text-zinc-300 leading-normal text-[11px]">
          Enterprise ATS engines parse .docx natively without OCR rasterization or ligature errors.
          Formatting tightly onto a single letter size page guarantees no orphan pages or misplaced lines.
        </p>
      </div>
    </div>
  );
};
