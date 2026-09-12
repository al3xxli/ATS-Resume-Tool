'use client';

import React from 'react';
import { ResumeData, ExperienceItem, ProjectItem } from '@/types/resume';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
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
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <h2 className="text-sm font-bold text-black">Resume Content Editor</h2>
          <p className="text-xs text-zinc-500">
            All edits update the live 1-page preview and .docx download immediately.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center text-xs px-2.5 py-1 rounded border border-zinc-300 bg-white hover:bg-zinc-100 text-black transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1 text-zinc-500" />
          Reset Master
        </button>
      </div>

      {/* Header & Contact Information */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
          Header & Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-medium text-black block mb-1">Full Name</label>
            <input
              type="text"
              value={resume.name}
              onChange={(e) => setResume((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs text-black"
            />
          </div>
          <div>
            <label className="font-medium text-black block mb-1">
              Target Job Title (Rule #2)
            </label>
            <input
              type="text"
              value={resume.targetJobTitle}
              onChange={(e) => setResume((prev) => ({ ...prev, targetJobTitle: e.target.value }))}
              className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs font-semibold text-black"
            />
          </div>
          <div>
            <label className="font-medium text-black block mb-1">Phone Number</label>
            <input
              type="text"
              value={resume.contact.phone}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs text-black"
            />
          </div>
          <div>
            <label className="font-medium text-black block mb-1">Email Address</label>
            <input
              type="email"
              value={resume.contact.email}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs text-black"
            />
          </div>
          <div>
            <label className="font-medium text-black block mb-1">LinkedIn Profile</label>
            <input
              type="text"
              value={resume.contact.linkedin}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, linkedin: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs text-black"
            />
          </div>
          <div>
            <label className="font-medium text-black block mb-1">Portfolio Website</label>
            <input
              type="text"
              value={resume.contact.portfolio}
              onChange={(e) =>
                setResume((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, portfolio: e.target.value },
                }))
              }
              className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs text-black"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider">
            Positioning Summary
          </h3>
          <span className="text-[11px] text-zinc-500">
            Line breaks (Shift+Enter or Enter) are preserved
          </span>
        </div>
        <textarea
          rows={3}
          value={resume.summary}
          onChange={(e) => setResume((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="Enter positioning summary (line breaks will show on resume)..."
          className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs text-black leading-relaxed font-sans"
        />
      </div>

      {/* Experience */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
          Professional Experience
        </h3>
        <div className="space-y-4">
          {resume.experience.map((exp, idx) => (
            <div key={exp.id} className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExp(idx, 'company', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Role Title</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExp(idx, 'role', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Date Range</label>
                  <input
                    type="text"
                    value={exp.dateRange}
                    onChange={(e) => updateExp(idx, 'dateRange', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                  />
                </div>
              </div>

              {/* Bullets */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-600 block">Bullets</label>
                {exp.highlights.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start space-x-1.5">
                    <span className="text-zinc-400 mt-1.5 text-xs">•</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => updateExpBullet(idx, bIdx, e.target.value)}
                      className="flex-1 p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed"
                    />
                    <button
                      onClick={() => removeExpBullet(idx, bIdx)}
                      className="text-zinc-400 hover:text-black p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addExpBullet(idx)}
                  className="text-xs text-black hover:underline font-medium inline-flex items-center mt-0.5"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Add bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
          Projects
        </h3>
        <div className="space-y-4">
          {resume.projects.map((proj, idx) => (
            <div key={proj.id} className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Project Name</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProj(idx, 'name', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Date Range</label>
                  <input
                    type="text"
                    value={proj.dateRange}
                    onChange={(e) => updateProj(idx, 'dateRange', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Subtitle</label>
                <input
                  type="text"
                  value={proj.subtitle}
                  onChange={(e) => updateProj(idx, 'subtitle', e.target.value)}
                  className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-600 block">Bullets</label>
                {proj.highlights.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start space-x-1.5">
                    <span className="text-zinc-400 mt-1.5 text-xs">•</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => updateProjBullet(idx, bIdx, e.target.value)}
                      className="flex-1 p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed"
                    />
                    <button
                      onClick={() => removeProjBullet(idx, bIdx)}
                      className="text-zinc-400 hover:text-black p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addProjBullet(idx)}
                  className="text-xs text-black hover:underline font-medium inline-flex items-center mt-0.5"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Add bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <h3 className="text-xs font-bold text-black uppercase tracking-wider">
          Technical Skills
        </h3>
        <div className="space-y-2">
          {resume.skills.map((category, cIdx) => (
            <div key={cIdx} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-1">
              <span className="text-xs font-bold text-black block">{category.category}</span>
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
                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                placeholder="Comma-separated items..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
