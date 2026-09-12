'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, JobAnalysisResult } from '@/types/resume';
import { Eye, FileCheck, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  jobAnalysis: JobAnalysisResult;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit helper on small viewports
  const handleFitToWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48; // padding
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
      // If currently zoomed to fit or viewport is small
      if (containerRef.current && containerRef.current.clientWidth - 48 < 816) {
        handleFitToWidth();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-200/80 overflow-hidden">
      {/* Top Preview Status & Sheet Controls */}
      <div className="bg-white px-4 py-2 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 z-20 shadow-2xs no-print shrink-0">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-xs font-semibold text-black">
            <Eye className="w-3.5 h-3.5 mr-1 text-zinc-600" />
            Letter Sheet (8.5&quot; × 11&quot;)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono">
            Fixed Dimensions • Non-Scaling Page
          </span>
        </div>

        {/* Zoom & Page Scale Controls */}
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
            title="Fit to screen width"
            className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 hover:bg-zinc-200 text-black font-medium transition-colors"
          >
            Fit
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Reset to 100% (True Letter Size)"
            className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 hover:bg-zinc-200 text-black font-medium transition-colors"
          >
            100%
          </button>
        </div>
      </div>

      {/* Document Workspace (Scrollable Gray Canvas) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 md:p-10 flex justify-center items-start"
      >
        {/* Scaling Wrapper: Keeps letter aspect ratio strictly locked without browser flex-stretch */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            width: '8.5in',
            height: '11in',
            marginBottom: `${(11 * 96 * (zoom - 1))}px`,
          }}
          className="shrink-0 transition-transform duration-100 ease-out"
        >
          {/* Strictly Fixed Letter Sheet (8.5in x 11in, 0.5in margins) */}
          <div
            id="printable-resume"
            style={{
              width: '8.5in',
              height: '11in',
              padding: '0.5in',
              boxSizing: 'border-box',
              fontFamily: 'Calibri, Arial, sans-serif',
              color: '#000000',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            className="text-black leading-snug border border-zinc-300"
          >
            {/* Header: Name, Target Job Title, Contact Info */}
            <div className="text-center pb-2 mb-2 border-b border-black">
              <h1 className="text-2xl font-bold tracking-tight text-black uppercase m-0 p-0 leading-tight">
                {resume.name}
              </h1>

              {/* Target Job Title (10.6x Factor, Black) */}
              {resume.targetJobTitle && (
                <div className="text-xs font-bold text-black uppercase tracking-wider mt-0.5">
                  {resume.targetJobTitle}
                </div>
              )}

              {/* Contact Info (Clean plain pipes) */}
              <div className="text-[11px] text-black mt-1 flex flex-wrap justify-center items-center gap-x-2.5 gap-y-0.5">
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
            </div>

            {/* Professional Summary / Positioning Statement */}
            {resume.summary && (
              <div className="text-[11px] text-black text-center mb-2 leading-normal">
                {resume.summary}
              </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <div className="mb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
                  EDUCATION
                </h2>
                <div className="space-y-1 text-[11px]">
                  {resume.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-baseline text-black">
                        <div>
                          <span className="font-bold text-black">{edu.institution}</span>
                          <span className="italic text-black"> — {edu.degree}</span>
                        </div>
                        <span className="font-bold text-black shrink-0 ml-2">{edu.dateRange}</span>
                      </div>
                      {edu.details.map((detail, idx) => (
                        <div key={idx} className="text-[10.5px] text-black pl-3 relative">
                          <span className="absolute left-0 top-0">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div className="mb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
                  PROJECTS
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  {resume.projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline text-black">
                        <div>
                          <span className="font-bold text-black">{proj.name}</span>
                          <span className="italic text-black"> — {proj.subtitle}</span>
                        </div>
                        <span className="font-bold text-black shrink-0 ml-2">{proj.dateRange}</span>
                      </div>
                      {proj.awards && (
                        <div className="text-[10.5px] italic text-black pl-3">
                          Awards: {proj.awards}
                        </div>
                      )}
                      <div className="space-y-0.5 mt-0.5">
                        {proj.highlights.map((bullet, idx) => (
                          <div key={idx} className="text-[10.5px] text-black pl-3 relative leading-snug">
                            <span className="absolute left-0 top-0">•</span>
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div className="mb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  {resume.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-black">
                        <div>
                          <span className="font-bold text-black">{exp.company}</span>
                          <span className="italic text-black"> — {exp.role}, {exp.location}</span>
                        </div>
                        <span className="font-bold text-black shrink-0 ml-2">{exp.dateRange}</span>
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {exp.highlights.map((bullet, idx) => (
                          <div key={idx} className="text-[10.5px] text-black pl-3 relative leading-snug">
                            <span className="absolute left-0 top-0">•</span>
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
                  TECHNICAL SKILLS
                </h2>
                <div className="space-y-0.5 text-[10.5px] text-black leading-snug">
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
