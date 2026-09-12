'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, ExperienceItem, ProjectItem, EducationItem, SkillCategory } from '@/types/resume';
import { Plus, Trash2, RotateCcw, X } from 'lucide-react';
import { alexLiOriginalResume } from '@/data/defaultResume';

/**
 * Splits comma-separated skills intelligently, preserving commas that appear
 * inside parentheses, e.g. "FDM 3D Printing (PLA, TPU, multi-material)" stays as 1 item.
 */
function splitSkillItems(text: string): string[] {
  const items: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '(' || char === '[' || char === '{') {
      parenDepth++;
      current += char;
    } else if (char === ')' || char === ']' || char === '}') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += char;
    } else if (char === ',' && parenDepth === 0) {
      if (current.trim()) {
        items.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    items.push(current.trim());
  }

  return items;
}

interface SkillCategoryEditorProps {
  category: SkillCategory;
  onUpdateCategoryName: (newName: string) => void;
  onUpdateItems: (newItems: string[]) => void;
  onRemoveCategory: () => void;
}

const SkillCategoryEditor: React.FC<SkillCategoryEditorProps> = ({
  category,
  onUpdateCategoryName,
  onUpdateItems,
  onRemoveCategory,
}) => {
  const [rawText, setRawText] = useState(category.items.join(', '));
  const lastSyncedRef = useRef(category.items.join(', '));

  useEffect(() => {
    const currentJoined = category.items.join(', ');
    if (currentJoined !== lastSyncedRef.current) {
      setRawText(currentJoined);
      lastSyncedRef.current = currentJoined;
    }
  }, [category.items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawText(val);

    const parsedItems = splitSkillItems(val);
    lastSyncedRef.current = parsedItems.join(', ');
    onUpdateItems(parsedItems);
  };

  const handleBlur = () => {
    const parsedItems = splitSkillItems(rawText);
    const normalized = parsedItems.join(', ');
    setRawText(normalized);
    lastSyncedRef.current = normalized;
    onUpdateItems(parsedItems);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const updated = category.items.filter((_, i) => i !== indexToRemove);
    const normalized = updated.join(', ');
    setRawText(normalized);
    lastSyncedRef.current = normalized;
    onUpdateItems(updated);
  };

  return (
    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded space-y-2">
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={category.category}
          onChange={(e) => onUpdateCategoryName(e.target.value)}
          className="text-xs font-bold text-black bg-transparent border-b border-dashed border-zinc-300 hover:border-black focus:border-black focus:outline-hidden px-1 py-0.5"
          placeholder="Category Name..."
        />
        <button
          type="button"
          onClick={onRemoveCategory}
          className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
          title="Remove Category"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <input
          type="text"
          value={rawText}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full p-2 bg-white border border-zinc-300 rounded text-xs text-black font-medium focus:outline-hidden focus:border-black"
          placeholder="Type skills separated by commas (e.g. Rhino 3D, Grasshopper, SolidWorks)..."
        />
      </div>

      {category.items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {category.items.map((item, iIdx) => (
            <span
              key={iIdx}
              className="inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-white border border-zinc-200 text-black shadow-2xs font-medium"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(iIdx)}
                className="ml-1 text-zinc-400 hover:text-black transition-colors"
                title={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface LanguagesEditorProps {
  languages: string[];
  onUpdateLanguages: (newLanguages: string[]) => void;
}

const LanguagesEditor: React.FC<LanguagesEditorProps> = ({
  languages,
  onUpdateLanguages,
}) => {
  const [rawText, setRawText] = useState(languages.join(', '));
  const lastSyncedRef = useRef(languages.join(', '));

  useEffect(() => {
    const currentJoined = languages.join(', ');
    if (currentJoined !== lastSyncedRef.current) {
      setRawText(currentJoined);
      lastSyncedRef.current = currentJoined;
    }
  }, [languages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawText(val);

    const parsedItems = splitSkillItems(val);
    lastSyncedRef.current = parsedItems.join(', ');
    onUpdateLanguages(parsedItems);
  };

  const handleBlur = () => {
    const parsedItems = splitSkillItems(rawText);
    const normalized = parsedItems.join(', ');
    setRawText(normalized);
    lastSyncedRef.current = normalized;
    onUpdateLanguages(parsedItems);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const updated = languages.filter((_, i) => i !== indexToRemove);
    const normalized = updated.join(', ');
    setRawText(normalized);
    lastSyncedRef.current = normalized;
    onUpdateLanguages(updated);
  };

  return (
    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded space-y-2">
      <span className="text-xs font-bold text-black block">Languages</span>
      <input
        type="text"
        value={rawText}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full p-2 bg-white border border-zinc-300 rounded text-xs text-black font-medium focus:outline-hidden focus:border-black"
        placeholder="Type languages separated by commas (e.g. English, Mandarin Chinese)..."
      />
      {languages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {languages.map((lang, lIdx) => (
            <span
              key={lIdx}
              className="inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-white border border-zinc-200 text-black shadow-2xs font-medium"
            >
              <span>{lang}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(lIdx)}
                className="ml-1 text-zinc-400 hover:text-black transition-colors"
                title={`Remove ${lang}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

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
      const fresh = JSON.parse(JSON.stringify(alexLiOriginalResume));
      setResume(fresh);
      try {
        localStorage.setItem('ats_resume_data', JSON.stringify(fresh));
      } catch {
        // ignore
      }
    }
  };

  // Education updates
  const updateEdu = (index: number, field: keyof EducationItem, value: any) => {
    setResume((prev) => {
      const edu = [...(prev.education || [])];
      edu[index] = { ...edu[index], [field]: value };
      return { ...prev, education: edu };
    });
  };

  const updateEduDetail = (eduIndex: number, detailIndex: number, text: string) => {
    setResume((prev) => {
      const edu = [...(prev.education || [])];
      const details = [...(edu[eduIndex].details || [])];
      details[detailIndex] = text;
      edu[eduIndex] = { ...edu[eduIndex], details };
      return { ...prev, education: edu };
    });
  };

  const addEduDetail = (eduIndex: number) => {
    setResume((prev) => {
      const edu = [...(prev.education || [])];
      edu[eduIndex] = {
        ...edu[eduIndex],
        details: [...(edu[eduIndex].details || []), 'Honors, relevant coursework, or thesis...'],
      };
      return { ...prev, education: edu };
    });
  };

  const removeEduDetail = (eduIndex: number, detailIndex: number) => {
    setResume((prev) => {
      const edu = [...(prev.education || [])];
      edu[eduIndex] = {
        ...edu[eduIndex],
        details: edu[eduIndex].details.filter((_, i) => i !== detailIndex),
      };
      return { ...prev, education: edu };
    });
  };

  const addEduItem = () => {
    setResume((prev) => {
      const newEdu: EducationItem = {
        id: `edu-${Date.now()}`,
        institution: 'University of California, Berkeley',
        degree: "Master's of Design — Design for Emerging Technologies",
        location: 'Berkeley, CA',
        dateRange: 'Aug 2026 - Dec 2027',
        details: ['College of Engineering and College of Environmental Design.'],
      };
      return { ...prev, education: [...(prev.education || []), newEdu] };
    });
  };

  const removeEduItem = (eduIndex: number) => {
    if (confirm('Remove this education entry?')) {
      setResume((prev) => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== eduIndex),
      }));
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

  const addExpItem = () => {
    setResume((prev) => {
      const newExp: ExperienceItem = {
        id: `exp-${Date.now()}`,
        company: 'Company Name',
        role: 'Job Role',
        location: 'City, State',
        dateRange: 'Jan 2026 - Present',
        highlights: ['Key achievement or technical impact with metrics...'],
      };
      return { ...prev, experience: [...prev.experience, newExp] };
    });
  };

  const removeExpItem = (expIndex: number) => {
    if (confirm('Remove this experience entry?')) {
      setResume((prev) => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== expIndex),
      }));
    }
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

  const addProjItem = () => {
    setResume((prev) => {
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        name: 'Project Name',
        subtitle: 'Key tools, purpose, or specs',
        dateRange: 'Jan 2026 - May 2026',
        highlights: ['Engineered solution resulting in measurable outcome...'],
      };
      return { ...prev, projects: [...prev.projects, newProj] };
    });
  };

  const removeProjItem = (projIndex: number) => {
    if (confirm('Remove this project entry?')) {
      setResume((prev) => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== projIndex),
      }));
    }
  };

  // Skills updates
  const addSkillCategory = () => {
    setResume((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          category: 'New Skill Category',
          items: ['Skill 1', 'Skill 2'],
        },
      ],
    }));
  };

  const removeSkillCategory = (cIdx: number) => {
    if (confirm('Remove this entire skill category?')) {
      setResume((prev) => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== cIdx),
      }));
    }
  };

  const updateSkillCategoryName = (cIdx: number, newName: string) => {
    setResume((prev) => {
      const skills = [...prev.skills];
      skills[cIdx] = { ...skills[cIdx], category: newName };
      return { ...prev, skills };
    });
  };

  const updateSkillCategoryItems = (cIdx: number, newItems: string[]) => {
    setResume((prev) => {
      const skills = [...prev.skills];
      skills[cIdx] = { ...skills[cIdx], items: newItems };
      return { ...prev, skills };
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

      {/* Education */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Education
            </h3>
            <p className="text-[11px] text-zinc-500">
              Line breaks (Shift+Enter or Enter) are preserved in details & degrees.
            </p>
          </div>
          <button
            onClick={addEduItem}
            className="text-xs text-black hover:underline font-medium inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" /> Add School
          </button>
        </div>

        <div className="space-y-4">
          {resume.education?.map((edu, idx) => (
            <div key={edu.id} className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-700">
                  School #{idx + 1}
                </span>
                <button
                  onClick={() => removeEduItem(idx)}
                  className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                  title="Remove this school"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEdu(idx, 'institution', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">
                    Degree / Program
                  </label>
                  <textarea
                    rows={1}
                    value={edu.degree}
                    onChange={(e) => updateEdu(idx, 'degree', e.target.value)}
                    placeholder="Degree, major, or credentials..."
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">
                    Date Range
                  </label>
                  <input
                    type="text"
                    value={edu.dateRange}
                    onChange={(e) => updateEdu(idx, 'dateRange', e.target.value)}
                    className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black"
                  />
                </div>
              </div>

              {/* Details & Bullets (Line Sensitive) */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-600 block">
                  Details / Honors / Coursework (Line-sensitive)
                </label>
                {edu.details?.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start space-x-1.5">
                    <span className="text-zinc-400 mt-1.5 text-xs">•</span>
                    <textarea
                      rows={2}
                      value={detail}
                      onChange={(e) => updateEduDetail(idx, dIdx, e.target.value)}
                      placeholder="Enter detail (Shift+Enter or Enter creates line breaks)..."
                      className="flex-1 p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed font-sans"
                    />
                    <button
                      onClick={() => removeEduDetail(idx, dIdx)}
                      className="text-zinc-400 hover:text-black p-1 transition-colors"
                      title="Remove detail"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addEduDetail(idx)}
                  className="text-xs text-black hover:underline font-medium inline-flex items-center mt-0.5"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Add detail / bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Professional Experience
            </h3>
            <p className="text-[11px] text-zinc-500">
              Line breaks (Shift+Enter or Enter) in bullets are preserved.
            </p>
          </div>
          <button
            onClick={addExpItem}
            className="text-xs text-black hover:underline font-medium inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" /> Add Position
          </button>
        </div>
        <div className="space-y-4">
          {resume.experience.map((exp, idx) => (
            <div key={exp.id} className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-700">
                  Role #{idx + 1}
                </span>
                <button
                  onClick={() => removeExpItem(idx)}
                  className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                  title="Remove this position"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

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
                      placeholder="Bullet achievement (Shift+Enter for line breaks)..."
                      className="flex-1 p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed font-sans"
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Projects
            </h3>
            <p className="text-[11px] text-zinc-500">
              Line breaks (Shift+Enter or Enter) in bullets are preserved.
            </p>
          </div>
          <button
            onClick={addProjItem}
            className="text-xs text-black hover:underline font-medium inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" /> Add Project
          </button>
        </div>
        <div className="space-y-4">
          {resume.projects.map((proj, idx) => (
            <div key={proj.id} className="p-3 bg-zinc-50 rounded border border-zinc-200 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-700">
                  Project #{idx + 1}
                </span>
                <button
                  onClick={() => removeProjItem(idx)}
                  className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                  title="Remove this project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

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
                      placeholder="Project metric or result (Shift+Enter for line breaks)..."
                      className="flex-1 p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed font-sans"
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

      {/* Skills Matrix & Languages */}
      <div className="bg-white p-4 rounded border border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">
              Technical Skills & Languages
            </h3>
            <p className="text-[11px] text-zinc-500">
              Type skills separated by commas (e.g. Rhino 3D, Grasshopper, SolidWorks).
            </p>
          </div>
          <button
            onClick={addSkillCategory}
            className="text-xs text-black hover:underline font-medium inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" /> Add Category
          </button>
        </div>

        <div className="space-y-3">
          {resume.skills.map((category, cIdx) => (
            <SkillCategoryEditor
              key={cIdx}
              category={category}
              onUpdateCategoryName={(name) => updateSkillCategoryName(cIdx, name)}
              onUpdateItems={(items) => updateSkillCategoryItems(cIdx, items)}
              onRemoveCategory={() => removeSkillCategory(cIdx)}
            />
          ))}

          {/* Languages */}
          <LanguagesEditor
            languages={resume.languages || []}
            onUpdateLanguages={(langs) => setResume((prev) => ({ ...prev, languages: langs }))}
          />
        </div>
      </div>
    </div>
  );
};
