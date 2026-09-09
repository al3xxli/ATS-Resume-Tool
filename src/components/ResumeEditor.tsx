'use client';

import React from 'react';
import { ResumeData, ExperienceItem, ProjectItem, SkillCategory } from '@/types/resume';
import { Plus, Trash2, RotateCcw, Save } from 'lucide-react';
import { alexLiOriginalResume } from '@/data/defaultResume';

interface ResumeEditorProps {
  resume: ResumeData;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  resume,
  setResume,
}) => {
  const handleReset = () => {
    if (confirm('Reset resume content back to Alex Li original master?')) {
      setResume(JSON.parse(JSON.stringify(alexLiOriginalResume)));
    }
  };

  // Experience updates
  const updateExp = (index: number, field: keyof ExperienceItem, value: any) => {
    setResume((prev) => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experience: exp };
    });
  };

  const updateExpBullet = (expIndex: number, bulletIndex: number, text: string) => {
    setResume((prev) => {
      const exp = [...prev.experience];
      const bullets = [...exp[expIndex].highlights];
      bullets[bulletIndex] = text;
      exp[expIndex] = { ...exp[expIndex], highlights: bullets };
      return { ...prev, experience: exp };
    });
  };

  const addExpBullet = (expIndex: number) => {
    setResume((prev) => {
      const exp = [...prev.experience];
      exp[expIndex] = {
        ...exp[expIndex],
        highlights: [...exp[expIndex].highlights, 'New achievement or responsibility...'],
      };
      return { ...prev, experience: exp };
    });
  };

  const removeExpBullet = (expIndex: number, bulletIndex: number) => {
    setResume((prev) => {
      const exp = [...prev.experience];
      exp[expIndex] = {
        ...exp[expIndex],
        highlights: exp[expIndex].highlights.filter((_, i) => i !== bulletIndex),
      };
      return { ...prev, experience: exp };
    });
  };

  // Project updates
  const updateProj = (index: number, field: keyof ProjectItem, value: any) => {
    setResume((prev) => {
      const projs = [...prev.projects];
      projs[index] = { ...projs[index], [field]: value };
      return { ...prev, projects: projs };
    });
  };

  const updateProjBullet = (projIndex: number, bulletIndex: number, text: string) => {
    setResume((prev) => {
      const projs = [...prev.projects];
      const bullets = [...projs[projIndex].highlights];
      bullets[bulletIndex] = text;
      projs[projIndex] = { ...projs[projIndex], highlights: bullets };
      return { ...prev, projects: projs };
    });
  };

  const addProjBullet = (projIndex: number) => {
    setResume((prev) => {
      const projs = [...prev.projects];
      projs[projIndex] = {
        ...projs[projIndex],
        highlights: [...projs[projIndex].highlights, 'New project metric or engineering result...'],
      };
      return { ...prev, projects: projs };
    });
  };

  const removeProjBullet = (projIndex: number, bulletIndex: number) => {
    setResume((prev) => {
      const projs = [...prev.projects];
      projs[projIndex] = {
        ...projs[projIndex],
        highlights: projs[projIndex].highlights.filter((_, i) => i !== bulletIndex),
      };
      return { ...prev, projects: projs };
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Live Resume Content Editor</h2>
          <p className="text-xs text-zinc-500">
            Edit text, dates, roles, or bullets. All changes sync directly to the ATS preview and .docx download.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center text-xs px-3 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
          Reset to Alex Li Master
        </button>
      </div>

      {/* Header & Contact Information */}
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Candidate Header & Contact Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-medium text-zinc-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={resume.name}
              onChange={(e) => setResume((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="font-medium text-zinc-700 block mb-1">
              Target Job Title <span className="text-blue-600 font-bold">(Rule #2)</span>
            </label>
            <input
              type="text"
              value={resume.targetJobTitle}
              onChange={(e) => setResume((prev) => ({ ...prev, targetJobTitle: e.target.value }))}
              className="w-full p-2 bg-blue-50/50 border border-blue-200 rounded-md text-xs font-semibold text-blue-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="font-medium text-zinc-700 block mb-1">Phone Number</label>
            <input
              type="text"
              value={resume.contact.phone}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
            />
          </div>
          <div>
            <label className="font-medium text-zinc-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={resume.contact.email}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
            />
          </div>
          <div>
            <label className="font-medium text-zinc-700 block mb-1">LinkedIn Profile</label>
            <input
              type="text"
              value={resume.contact.linkedin}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, linkedin: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
            />
          </div>
          <div>
            <label className="font-medium text-zinc-700 block mb-1">Portfolio / Website</label>
            <input
              type="text"
              value={resume.contact.portfolio}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, portfolio: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs"
            />
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Professional Summary
        </h3>
        <textarea
          rows={3}
          value={resume.summary}
          onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
          className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs leading-relaxed"
        />
      </div>

      {/* Professional Experience */}
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Professional Experience
          </h3>
        </div>

        <div className="space-y-5">
          {resume.experience.map((exp, idx) => (
            <div key={exp.id} className="p-4 bg-zinc-50/60 rounded-md border border-zinc-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExp(idx, 'company', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">Role Title</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExp(idx, 'role', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs font-medium text-blue-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">
                    Date Range (Mon YYYY - Mon YYYY)
                  </label>
                  <input
                    type="text"
                    value={exp.dateRange}
                    onChange={(e) => updateExp(idx, 'dateRange', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* Bullet Points */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Achievement Bullets</label>
                {exp.highlights.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start space-x-2">
                    <span className="text-zinc-400 mt-2 text-xs">•</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => updateExpBullet(idx, bIdx, e.target.value)}
                      className="flex-1 p-2 bg-white border border-zinc-200 rounded text-xs leading-relaxed"
                    />
                    <button
                      onClick={() => removeExpBullet(idx, bIdx)}
                      className="text-zinc-400 hover:text-red-500 p-1 mt-1 transition-colors"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addExpBullet(idx)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center mt-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Technical & Design Projects
        </h3>
        <div className="space-y-5">
          {resume.projects.map((proj, idx) => (
            <div key={proj.id} className="p-4 bg-zinc-50/60 rounded-md border border-zinc-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">Project Name</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProj(idx, 'name', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">Date Range</label>
                  <input
                    type="text"
                    value={proj.dateRange}
                    onChange={(e) => updateProj(idx, 'dateRange', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">Subtitle / Focus</label>
                <input
                  type="text"
                  value={proj.subtitle}
                  onChange={(e) => updateProj(idx, 'subtitle', e.target.value)}
                  className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-700"
                />
              </div>

              {proj.awards && (
                <div>
                  <label className="text-[11px] font-medium text-zinc-600 block mb-0.5">Awards / Honors</label>
                  <input
                    type="text"
                    value={proj.awards}
                    onChange={(e) => updateProj(idx, 'awards', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-200 rounded text-xs text-emerald-800"
                  />
                </div>
              )}

              {/* Bullet Points */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">Project Bullets</label>
                {proj.highlights.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start space-x-2">
                    <span className="text-zinc-400 mt-2 text-xs">•</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => updateProjBullet(idx, bIdx, e.target.value)}
                      className="flex-1 p-2 bg-white border border-zinc-200 rounded text-xs leading-relaxed"
                    />
                    <button
                      onClick={() => removeProjBullet(idx, bIdx)}
                      className="text-zinc-400 hover:text-red-500 p-1 mt-1 transition-colors"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addProjBullet(idx)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center mt-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Technical Skills & Categories
        </h3>
        <div className="space-y-3">
          {resume.skills.map((category, cIdx) => (
            <div key={cIdx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-md space-y-1.5">
              <span className="text-xs font-bold text-zinc-900 block">{category.category}</span>
              <input
                type="text"
                value={category.items.join(', ')}
                onChange={(e) => {
                  const newItems = e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setResume((prev) => {
                    const skills = [...prev.skills];
                    skills[cIdx] = { ...skills[cIdx], items: newItems };
                    return { ...prev, skills };
                  });
                }}
                className="w-full p-2 bg-white border border-zinc-200 rounded text-xs"
                placeholder="Comma separated skills..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
