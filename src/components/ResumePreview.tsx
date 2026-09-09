'use client';

import React, { useState } from 'react';
import { ResumeData, JobAnalysisResult } from '@/types/resume';
import { Eye, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  jobAnalysis: JobAnalysisResult;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  jobAnalysis,
}) => {
  const [highlightKeywords, setHighlightKeywords] = useState(true);

  // Set of matched keyword strings in lowercase for quick highlight
  const matchedSet = new Set(
    jobAnalysis.keywords
      .filter((k) => k.matched)
      .map((k) => k.keyword.toLowerCase())
  );

  // Helper to highlight words if enabled
  const renderTextWithHighlights = (text: string) => {
    if (!highlightKeywords || matchedSet.size === 0) {
      return text;
    }

    // Sort keywords by length descending so multi-word terms match first
    const sortedTerms = Array.from(matchedSet).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(
      `\\b(${sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'gi'
    );

    const parts = text.split(pattern);
    return parts.map((part, i) => {
      if (matchedSet.has(part.toLowerCase())) {
        return (
          <mark
            key={i}
            className="bg-emerald-100 text-emerald-950 px-1 py-0.2 rounded font-medium border-b border-emerald-300"
            title={`Matched keyword: ${part}`}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-100 overflow-y-auto">
      {/* Top preview control bar */}
      <div className="bg-white px-6 py-2.5 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-xs font-semibold text-zinc-700">
            <Eye className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            ATS Document Stream (Single-Column Preview)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
            Calibri 11pt • 0.75&quot; Margins • No Scrambling
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1.5 text-xs text-zinc-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highlightKeywords}
              onChange={(e) => setHighlightKeywords(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 border-zinc-300"
            />
            <span className="font-medium text-xs">Highlight Matched Keywords</span>
          </label>
        </div>
      </div>

      {/* Document Sheet Container */}
      <div className="p-6 md:p-10 flex justify-center">
        <div
          id="printable-resume"
          className="w-full max-w-[820px] bg-white shadow-md border border-zinc-200 rounded-sm p-8 md:p-12 text-zinc-900 font-sans"
          style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
        >
          {/* Header Block: Name & Target Title */}
          <div className="text-center pb-4 mb-4 border-b border-zinc-300">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 uppercase">
              {resume.name}
            </h1>

            {/* Target Job Title (10.6x factor) */}
            {resume.targetJobTitle && (
              <div className="mt-1 flex items-center justify-center space-x-2">
                <span className="text-sm md:text-base font-bold text-blue-700 uppercase tracking-wide">
                  {resume.targetJobTitle}
                </span>
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  10.6x Match
                </span>
              </div>
            )}

            {/* Contact Info (in body text) */}
            <div className="text-xs text-zinc-600 mt-2 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
              {resume.contact.phone && <span>{resume.contact.phone}</span>}
              {resume.contact.email && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>{resume.contact.email}</span>
                </>
              )}
              {resume.contact.linkedin && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>{resume.contact.linkedin}</span>
                </>
              )}
              {resume.contact.portfolio && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>{resume.contact.portfolio}</span>
                </>
              )}
              {resume.contact.location && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>{resume.contact.location}</span>
                </>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {resume.summary && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2">
                Professional Summary
              </h2>
              <p className="text-[13px] text-zinc-700 leading-relaxed">
                {renderTextWithHighlights(resume.summary)}
              </p>
            </div>
          )}

          {/* Professional Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2.5">
                Professional Experience
              </h2>
              <div className="space-y-4">
                {resume.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs">
                      <div>
                        <span className="font-bold text-zinc-900 text-[13px]">{exp.company}</span>
                        <span className="text-zinc-600 italic ml-1.5">— {exp.location}</span>
                      </div>
                      <span className="text-zinc-700 font-semibold mt-0.5 sm:mt-0">
                        {exp.dateRange}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-blue-700 mb-1.5">
                      {renderTextWithHighlights(exp.role)}
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-zinc-700">
                      {exp.highlights.map((bullet, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {renderTextWithHighlights(bullet)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2.5">
                Technical & Design Projects
              </h2>
              <div className="space-y-4">
                {resume.projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs">
                      <span className="font-bold text-zinc-900 text-[13px]">
                        {renderTextWithHighlights(proj.name)}
                      </span>
                      <span className="text-zinc-700 font-semibold mt-0.5 sm:mt-0">
                        {proj.dateRange}
                      </span>
                    </div>
                    {proj.subtitle && (
                      <div className="text-xs italic text-zinc-600 mb-1">
                        {renderTextWithHighlights(proj.subtitle)}
                      </div>
                    )}
                    {proj.awards && (
                      <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded mb-1.5 border border-emerald-100">
                        Awards: {proj.awards}
                      </div>
                    )}
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-zinc-700">
                      {proj.highlights.map((bullet, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {renderTextWithHighlights(bullet)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2.5">
                Education
              </h2>
              <div className="space-y-3">
                {resume.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-xs">
                      <span className="font-bold text-zinc-900 text-[13px]">{edu.institution}</span>
                      <span className="text-zinc-700 font-semibold mt-0.5 sm:mt-0">
                        {edu.dateRange}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-blue-700 mb-1">
                      {renderTextWithHighlights(edu.degree)}
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-zinc-700">
                      {edu.details.map((detail, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {renderTextWithHighlights(detail)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-800 pb-0.5 mb-2.5">
                Technical Skills
              </h2>
              <div className="space-y-1.5 text-xs text-zinc-800">
                {resume.skills.map((cat, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="font-bold text-zinc-900">{cat.category}: </span>
                    <span className="text-zinc-700">
                      {cat.items.map((item, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && ', '}
                          {renderTextWithHighlights(item)}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                ))}
                {resume.languages && resume.languages.length > 0 && (
                  <div className="pt-1">
                    <span className="font-bold text-zinc-900">Languages: </span>
                    <span className="text-zinc-700">{resume.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
