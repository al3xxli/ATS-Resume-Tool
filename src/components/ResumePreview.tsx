'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, JobAnalysisResult } from '@/types/resume';
import { AllowedFont } from '@/utils/docxGenerator';
import { Eye, ZoomIn, ZoomOut, Type, Sparkles } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  jobAnalysis: JobAnalysisResult;
  fontFamily: AllowedFont;
  setFontFamily: (font: AllowedFont) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  fontFamily,
  setFontFamily,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit helper on small viewports
  const handleFitToWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48;
    const sheetWidthPx = 816; // 8.5in * 96dpi
    if (containerWidth < sheetWidthPx) {
      const calculatedZoom = Math.max(0.45, Math.min(1, containerWidth / sheetWidthPx));
      setZoom(Number(calculatedZoom.toFixed(2)));
    } else {
      setZoom(1);
    }
  };

  useEffect(() => {
    handleFitToWidth();
    const handleResize = () => {
      if (containerRef.current && containerRef.current.clientWidth - 48 < 816) {
        handleFitToWidth();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCssFontFamily = (font: AllowedFont) => {
    switch (font) {
      case 'Arial':
        return 'Arial, Helvetica, sans-serif';
      case 'Times New Roman':
        return '"Times New Roman", Times, serif';
      case 'Calibri':
      default:
        return 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-200/80 overflow-hidden">
      {/* Top Preview Controls: Font selection & Zoom */}
      <div className="bg-white px-4 py-2 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 z-20 shadow-2xs no-print shrink-0">
        {/* Font Style Selector (Classic Professional Fonts) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs font-semibold text-black">
            <Type className="w-3.5 h-3.5 mr-1 text-zinc-600" />
            <span>Font:</span>
          </div>
          <div className="flex items-center bg-zinc-100 p-0.5 rounded text-xs">
            {(['Calibri', 'Arial', 'Times New Roman'] as AllowedFont[]).map((font) => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={`px-2 py-0.5 rounded transition-all ${
                  fontFamily === font
                    ? 'bg-white text-black font-semibold shadow-2xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {font}
              </button>
            ))}
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 hidden sm:inline font-mono">
            Smart Spacing • Filled 1-Page Letter
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
            title="Zoom Out"
            className="p-1 rounded hover:bg-zinc-100 text-zinc-700 hover:text-black transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium text-black w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            title="Zoom In"
            className="p-1 rounded hover:bg-zinc-100 text-zinc-700 hover:text-black transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-zinc-300">|</span>
          <button
            onClick={handleFitToWidth}
            title="Fit to width"
            className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 hover:bg-zinc-200 text-black font-medium transition-colors"
          >
            Fit
          </button>
          <button
            onClick={() => setZoom(1)}
            title="True 100% Letter Size"
            className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 hover:bg-zinc-200 text-black font-medium transition-colors"
          >
            100%
          </button>
        </div>
      </div>

      {/* Document Workspace Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 md:p-10 flex justify-center items-start"
      >
        {/* Scaling Wrapper */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            width: '8.5in',
            height: '11in',
            marginBottom: `${11 * 96 * (zoom - 1)}px`,
          }}
          className="shrink-0 transition-transform duration-100 ease-out"
        >
          {/* Strictly Fixed Letter Sheet with Smart Spacing (no more than 1/10th bottom margin) */}
          <div
            id="printable-resume"
            style={{
              width: '8.5in',
              height: '11in',
              padding: '0.6in 0.65in',
              boxSizing: 'border-box',
              fontFamily: getCssFontFamily(fontFamily),
              color: '#000000',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            className="text-black leading-[1.28] border border-zinc-300 flex flex-col justify-between"
          >
            {/* 1. Header: Name (18pt), Title (12pt), Contact (10pt), Summary (10pt) */}
            <div className="text-center">
              <h1 className="text-[24px] font-bold tracking-tight text-black uppercase m-0 p-0 leading-tight">
                {resume.name}
              </h1>

              {/* Exact Target Job Title (12pt / 16px) */}
              {resume.targetJobTitle && (
                <div className="text-[15px] font-bold text-black uppercase tracking-wider mt-0.5">
                  {resume.targetJobTitle}
                </div>
              )}

              {/* Contact Info (10pt / 13.3px) */}
              <div className="text-[13px] text-black mt-1 flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5 pb-2 border-b border-black">
                {resume.contact.phone && <span>{resume.contact.phone}</span>}
                {resume.contact.email && (
                  <>
                    <span>|</span>
                    <span>{resume.contact.email}</span>
                  </>
                )}
                {resume.contact.linkedin && (
                  <>
                    <span>|</span>
                    <span>{resume.contact.linkedin}</span>
                  </>
                )}
                {resume.contact.portfolio && (
                  <>
                    <span>|</span>
                    <span>{resume.contact.portfolio}</span>
                  </>
                )}
                {resume.contact.location && (
                  <>
                    <span>|</span>
                    <span>{resume.contact.location}</span>
                  </>
                )}
              </div>

              {/* Positioning Statement (10pt, line-sensitive) */}
              {resume.summary && (
                <div className="text-[13px] text-black text-center mt-2 leading-[1.26] whitespace-pre-line">
                  {resume.summary}
                </div>
              )}
            </div>

            {/* 2. Education */}
            {resume.education && resume.education.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
                  EDUCATION
                </h2>
                <div className="space-y-3.5 text-[13px]">
                  {resume.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline text-black">
                        <div>
                          <span className="font-bold text-black">{edu.institution}</span>
                          <span className="italic text-black whitespace-pre-line"> — {edu.degree}</span>
                        </div>
                        <span className="text-black shrink-0 ml-2">{edu.dateRange}</span>
                      </div>
                      {edu.details.map((detail, idx) => (
                        <div key={idx} className="text-[13px] text-black pl-3.5 relative leading-[1.26] mt-0.5">
                          <span className="absolute left-0 top-0">•</span>
                          <span className="whitespace-pre-line">{detail}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
                  PROJECTS
                </h2>
                <div className="space-y-3.5 text-[13px]">
                  {resume.projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline text-black">
                        <div>
                          <span className="font-bold text-black">{proj.name}</span>
                          <span className="italic text-black whitespace-pre-line"> — {proj.subtitle}</span>
                        </div>
                        <span className="text-black shrink-0 ml-2">{proj.dateRange}</span>
                      </div>
                      {proj.awards && (
                        <div className="text-[12.5px] italic text-black pl-3.5 my-0.5">
                          Awards: {proj.awards}
                        </div>
                      )}
                      <div className="space-y-0.5 mt-0.5">
                        {proj.highlights.map((bullet, idx) => (
                          <div key={idx} className="text-[13px] text-black pl-3.5 relative leading-[1.26]">
                            <span className="absolute left-0 top-0">•</span>
                            <span className="whitespace-pre-line">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Professional Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="space-y-3.5 text-[13px]">
                  {resume.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-black">
                        <div>
                          <span className="font-bold text-black">{exp.company}</span>
                          <span className="italic text-black whitespace-pre-line"> — {exp.role}, {exp.location}</span>
                        </div>
                        <span className="text-black shrink-0 ml-2">{exp.dateRange}</span>
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {exp.highlights.map((bullet, idx) => (
                          <div key={idx} className="text-[13px] text-black pl-3.5 relative leading-[1.26]">
                            <span className="absolute left-0 top-0">•</span>
                            <span className="whitespace-pre-line">{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Technical Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
                  TECHNICAL SKILLS
                </h2>
                <div className="space-y-1.5 text-[13px] text-black leading-[1.26]">
                  {resume.skills.map((cat, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-black">{cat.category}: </span>
                      <span className="text-black">{cat.items.join(', ')}</span>
                    </div>
                  ))}
                  {resume.languages && resume.languages.length > 0 && (
                    <div>
                      <span className="font-bold text-black">Languages: </span>
                      <span className="text-black">{resume.languages.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
