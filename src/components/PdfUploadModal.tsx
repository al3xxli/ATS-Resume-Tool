'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileUp,
  X,
  Sparkles,
  Cpu,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResume: (newResume: ResumeData, backupToTracker: boolean, fileName: string) => void;
  hasTrackedJobs: boolean;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyResume,
  hasTrackedJobs,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    resume: ResumeData;
    method: 'gemini' | 'heuristic';
    pageCount: number;
    fileName: string;
    note?: string;
  } | null>(null);

  const [backupCurrent, setBackupCurrent] = useState(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load client API key if present in localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('ats_gemini_api_key') || '';
      setApiKey(savedKey);
    } catch {
      // Ignore localStorage errors
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process selected PDF file
  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF (.pdf) file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File is too large. Please select a PDF smaller than 20MB.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProcessingStep('Reading PDF document bytes...');

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
      });
      reader.readAsDataURL(file);

      const base64String = await base64Promise;

      setProcessingStep(
        apiKey
          ? 'Analyzing layout & fixing ligatures with Gemini AI...'
          : 'Extracting text streams with offline engine...'
      );

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64String,
          fileName: file.name,
          clientApiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume from PDF.');
      }

      setExtractedData({
        resume: data.resume,
        method: data.method,
        pageCount: data.pageCount || 1,
        fileName: file.name,
        note: data.note,
      });
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      setError(err.message || 'An error occurred while parsing the PDF.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleApply = () => {
    if (!extractedData) return;
    onApplyResume(extractedData.resume, backupCurrent, extractedData.fileName);
    onClose();
  };

  const handleReset = () => {
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('ats_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('ats_gemini_api_key');
      }
    } catch {
      // Ignore
    }
    setShowKeyInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-2xs">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black flex items-center space-x-2">
                <span>Upload PDF Resume</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700">
                  ATS Import
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Transform any existing PDF into an ATS-compliant, single-page Master
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-black rounded-md hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Engine Status Banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <div className="flex items-center space-x-2">
              {apiKey ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-black">Gemini AI Active</span>
                    <span className="text-zinc-500 ml-1.5">
                      • Multimodal visual parsing & ligature repair
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-black">Offline Heuristic Engine</span>
                    <span className="text-zinc-500 ml-1.5">
                      • Zero API key required (local text extraction)
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              className="text-[11px] text-zinc-600 hover:text-black font-medium underline flex items-center ml-2 shrink-0"
            >
              <Key className="w-3 h-3 mr-1" />
              {apiKey ? 'Edit Key' : 'Add Gemini Key'}
            </button>
          </div>

          {/* Optional inline API key drawer */}
          {showKeyInput && (
            <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black">Google AI Studio API Key (Optional)</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Get free key ↗
                </a>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs font-mono focus:outline-hidden focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(apiKey)}
                  className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white font-medium rounded text-xs transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Extraction Warning: </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* View State: Initial Dropzone */}
          {!extractedData && !isProcessing && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-black bg-zinc-100/70 scale-[1.01]'
                  : 'border-zinc-300 hover:border-black bg-zinc-50/50 hover:bg-zinc-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-3 shadow-2xs">
                <FileUp className="w-6 h-6 text-zinc-700" />
              </div>

              <h3 className="text-sm font-bold text-black mb-1">
                Click to browse or drop your PDF resume here
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mb-4">
                Supports standard and graphical resumes from Figma, Canva, InDesign, Word, or LaTeX
              </p>

              <div className="inline-flex items-center space-x-4 text-[11px] text-zinc-400 font-medium">
                <span className="flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Auto-repairs broken ligatures
                </span>
                <span>•</span>
                <span>Max 20MB</span>
                <span>•</span>
                <span>Single or Multi-Page</span>
              </div>
            </div>
          )}

          {/* View State: Processing Loader */}
          {isProcessing && (
            <div className="border border-zinc-200 bg-zinc-50 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-black">Parsing Resume Content</h3>
                <p className="text-xs text-zinc-500 animate-pulse">{processingStep}</p>
              </div>
              <div className="w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full animate-progress" />
              </div>
            </div>
          )}

          {/* View State: Extracted Preview Card */}
          {extractedData && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-black">
                        Extracted from {extractedData.fileName}
                      </span>
                      <span className="text-[11px] text-zinc-500 ml-2">
                        ({extractedData.pageCount} {extractedData.pageCount === 1 ? 'page' : 'pages'})
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      extractedData.method === 'gemini'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    {extractedData.method === 'gemini' ? 'Gemini AI' : 'Heuristic Engine'}
                  </span>
                </div>

                {/* Candidate & Contact summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Candidate Name
                    </span>
                    <span className="font-bold text-sm text-black">
                      {extractedData.resume.name || 'Candidate Name'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Target Job Title
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {extractedData.resume.targetJobTitle || 'Not specified'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Contact Details
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-zinc-600 font-medium text-[11px]">
                      {extractedData.resume.contact.email && (
                        <span>✉ {extractedData.resume.contact.email}</span>
                      )}
                      {extractedData.resume.contact.phone && (
                        <span>☎ {extractedData.resume.contact.phone}</span>
                      )}
                      {extractedData.resume.contact.location && (
                        <span>📍 {extractedData.resume.contact.location}</span>
                      )}
                      {extractedData.resume.contact.linkedin && (
                        <span>🔗 LinkedIn</span>
                      )}
                      {extractedData.resume.contact.portfolio && (
                        <span>🌐 Portfolio</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics Breakdown */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-200 text-center">
                  <div className="p-2 bg-white rounded border border-zinc-200 shadow-2xs">
                    <span className="text-xs font-bold text-black block">
                      {extractedData.resume.experience.length}
                    </span>
                    <span className="text-[10px] text-zinc-500">Experience</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-zinc-200 shadow-2xs">
                    <span className="text-xs font-bold text-black block">
                      {extractedData.resume.education.length}
                    </span>
                    <span className="text-[10px] text-zinc-500">Education</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-zinc-200 shadow-2xs">
                    <span className="text-xs font-bold text-black block">
                      {extractedData.resume.projects.length}
                    </span>
                    <span className="text-[10px] text-zinc-500">Projects</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-zinc-200 shadow-2xs">
                    <span className="text-xs font-bold text-black block">
                      {extractedData.resume.skills.length}
                    </span>
                    <span className="text-[10px] text-zinc-500">Skill Groups</span>
                  </div>
                </div>

                {/* Summary preview */}
                {extractedData.resume.summary && (
                  <div className="pt-2 border-t border-zinc-200 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      Positioning Summary Preview
                    </span>
                    <p className="text-zinc-700 italic whitespace-pre-line text-[11px] bg-white p-2 rounded border border-zinc-200">
                      {extractedData.resume.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Safe Backup Option */}
              <label className="flex items-center space-x-2.5 text-xs text-zinc-700 cursor-pointer p-2 rounded hover:bg-zinc-50 transition-colors">
                <input
                  type="checkbox"
                  checked={backupCurrent}
                  onChange={(e) => setBackupCurrent(e.target.checked)}
                  className="rounded border-zinc-300 text-black focus:ring-black h-4 w-4"
                />
                <span>
                  Save current resume as a snapshot in Tracker before replacing
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          {extractedData ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-600 hover:text-black font-medium transition-colors"
              >
                Upload Different PDF
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-black hover:bg-zinc-800 rounded shadow-2xs transition-colors flex items-center"
                >
                  <span>Apply & ATS Optimize</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
