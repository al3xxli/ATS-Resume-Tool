'use client';

import React from 'react';
import { ResumeData, JobAnalysisResult } from '@/types/resume';
import { Eye, FileCheck } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  jobAnalysis: JobAnalysisResult;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
}) => {
  return (
    <div className="flex flex-col h-full bg-zinc-200/60 overflow-y-auto">
      {/* Top Preview Status Bar */}
      <div className="bg-white px-5 py-2 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs no-print">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center text-xs font-semibold text-black">
            <Eye className="w-3.5 h-3.5 mr-1 text-zinc-600" />
            Letter Size (8.5&quot; × 11&quot;) — Single Page
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono">
            Calibri • Black on White • Single Column
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-600 font-medium">
          <FileCheck className="w-3.5 h-3.5 text-black" />
          <span>Strict 1-Page ATS Standard</span>
        </div>
      </div>

      {/* Document Sheet Container (Calibrated strictly for Letter size single page) */}
      <div className="p-4 md:p-8 flex justify-center items-start flex-1">
        <div
          id="printable-resume"
          className="w-full max-w-[800px] bg-white shadow-sm border border-zinc-300 p-8 md:p-10 text-black font-sans leading-snug"
          style={{
            fontFamily: 'Calibri, Arial, sans-serif',
            color: '#000000',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Header: Name, Target Job Title, Contact Info */}
          <div className="text-center pb-2 mb-2 border-b border-black">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-black uppercase m-0 p-0">
              {resume.name}
            </h1>

            {/* Target Job Title (10.6x Factor, Black) */}
            {resume.targetJobTitle && (
              <div className="text-xs md:text-sm font-bold text-black uppercase tracking-wide mt-0.5">
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
            <div className="text-[11px] text-black text-center mb-2.5 leading-normal">
              {resume.summary}
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div className="mb-2.5">
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
            <div className="mb-2.5">
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
            <div className="mb-2.5">
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
  );
};
