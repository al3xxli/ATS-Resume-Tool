'use client';

import React, { useState } from 'react';
import {
  X,
  ArrowLeftRight,
  Plus,
  Trash2,
  BookmarkCheck,
  Search,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { ProjectPacket } from '@/types/packets';

interface ProjectSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlotIndex: number | null;
  targetSlotName?: string;
  packets: ProjectPacket[];
  onSwap: (packet: ProjectPacket, slotIndex: number | null) => void;
  onSavePacket: (packet: ProjectPacket) => void;
  onDeletePacket: (packetId: string) => void;
  onResetDefaults: () => void;
}

export const ProjectSwapModal: React.FC<ProjectSwapModalProps> = ({
  isOpen,
  onClose,
  targetSlotIndex,
  targetSlotName,
  packets,
  onSwap,
  onSavePacket,
  onDeletePacket,
  onResetDefaults,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // New packet form state
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDateRange, setNewDateRange] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectPacket['category']>('hardware');
  const [newBullet1, setNewBullet1] = useState('');
  const [newBullet2, setNewBullet2] = useState('');

  if (!isOpen) return null;

  const isSwapMode = targetSlotIndex !== null && targetSlotIndex !== undefined;

  const filteredPackets = packets.filter((p) => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesFilter;

    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
      p.highlights.some((h) => h.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const bullets = [newBullet1.trim(), newBullet2.trim()].filter(Boolean);

    const newPacket: ProjectPacket = {
      id: `packet-${Date.now()}`,
      name: newName.trim(),
      subtitle: newSubtitle.trim() || 'Key tools & technical methodology',
      dateRange: newDateRange.trim() || '2025',
      category: newCategory,
      tags: [newCategory],
      highlights: bullets.length > 0 ? bullets : ['Project design and technical execution...'],
    };

    onSavePacket(newPacket);
    setIsCreating(false);
    setNewName('');
    setNewSubtitle('');
    setNewDateRange('');
    setNewBullet1('');
    setNewBullet2('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-zinc-300 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-black text-white rounded">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center">
                {isSwapMode ? (
                  <>
                    <span>Swap Project Slot #{targetSlotIndex + 1}</span>
                    {targetSlotName && (
                      <span className="text-zinc-500 font-normal ml-1.5 text-xs truncate max-w-[240px]">
                        ({targetSlotName})
                      </span>
                    )}
                  </>
                ) : (
                  <span>Project Packets Library</span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {isSwapMode
                  ? 'Pick any saved project packet below to instantly swap into this resume slot.'
                  : 'Manage and organize modular project packets for instant 1-click swaps.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-black p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Create Button */}
        <div className="p-3 border-b border-zinc-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, tool, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs text-black placeholder-zinc-400 focus:outline-hidden focus:border-black"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {['all', 'hardware', 'computational', 'ai', 'architecture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-1 rounded text-[11px] font-medium capitalize whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-black text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreating((prev) => !prev)}
            className="px-2.5 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {isCreating ? 'Cancel' : 'New Packet'}
          </button>
        </div>

        {/* Inline Packet Creator Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-zinc-50 border-b border-zinc-300 space-y-3 animate-in slide-in-from-top-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-black uppercase tracking-wider text-[10px]">
                Create New Project Packet
              </span>
              <span className="text-[10px] text-zinc-500">Will be saved to local library</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kinetic Facade..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs font-bold text-black focus:outline-hidden focus:border-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Date Range</label>
                <input
                  type="text"
                  placeholder="e.g. Jan 2025 - May 2025"
                  value={newDateRange}
                  onChange={(e) => setNewDateRange(e.target.value)}
                  className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black focus:outline-hidden focus:border-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black focus:outline-hidden focus:border-black"
                >
                  <option value="hardware">Hardware</option>
                  <option value="computational">Computational</option>
                  <option value="ai">AI / Automation</option>
                  <option value="architecture">Architecture</option>
                  <option value="fabrication">Fabrication</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-600 block mb-0.5">Subtitle</label>
              <input
                type="text"
                placeholder="e.g. Split Ergonomic Keyboard, 42 Keys, Designed and Built from Scratch"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-zinc-600 block">Bullet Highlights (1–2 recommended)</label>
              <textarea
                rows={2}
                placeholder="Bullet 1: Measurable outcome, CAD tools, testing result..."
                value={newBullet1}
                onChange={(e) => setNewBullet1(e.target.value)}
                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed focus:outline-hidden focus:border-black"
              />
              <textarea
                rows={2}
                placeholder="Bullet 2 (Optional): Prototyping methods, materials, fabrication..."
                value={newBullet2}
                onChange={(e) => setNewBullet2(e.target.value)}
                className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs text-black leading-relaxed focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 border border-zinc-300 rounded text-xs text-zinc-600 hover:text-black font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 bg-black text-white rounded text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Save Packet to Library
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Packet Cards List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredPackets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No project packets found. Click <strong>+ New Packet</strong> to create one or reset defaults.
            </div>
          ) : (
            filteredPackets.map((packet) => (
              <div
                key={packet.id}
                className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md hover:border-zinc-400 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-black">{packet.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200 text-zinc-800 rounded font-mono font-medium capitalize">
                        {packet.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 italic leading-snug">
                      {packet.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {packet.dateRange}
                    </span>

                    <button
                      onClick={() => onSwap(packet, targetSlotIndex)}
                      className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-semibold hover:bg-zinc-800 transition-colors flex items-center shadow-2xs"
                      title={isSwapMode ? `Swap into Slot #${(targetSlotIndex || 0) + 1}` : 'Insert into resume'}
                    >
                      <ArrowLeftRight className="w-3 h-3 mr-1" />
                      {isSwapMode ? `Swap Slot #${(targetSlotIndex || 0) + 1}` : 'Insert'}
                    </button>

                    <button
                      onClick={() => onDeletePacket(packet.id)}
                      className="p-1 text-zinc-300 hover:text-red-600 transition-colors"
                      title="Delete packet from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {packet.awards && (
                  <p className="text-[10px] text-zinc-700 font-medium bg-white px-2 py-0.5 rounded border border-zinc-200 inline-block">
                    ★ {packet.awards}
                  </p>
                )}

                {/* Bullets */}
                <ul className="space-y-1 text-xs text-zinc-800 pl-3 list-disc marker:text-zinc-400">
                  {packet.highlights.map((bullet, bIdx) => (
                    <li key={bIdx} className="leading-normal text-[11px]">
                      {bullet}
                    </li>
                  ))}
                </ul>

                {/* Tags if any */}
                {packet.tags && packet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {packet.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9px] px-1.5 py-0.2 bg-white border border-zinc-200 text-zinc-500 rounded font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">
            {packets.length} project packet{packets.length === 1 ? '' : 's'} saved in library.
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onResetDefaults}
              className="text-zinc-500 hover:text-black transition-colors flex items-center text-[11px]"
              title="Reset default project bank"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Library Defaults
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white border border-zinc-300 rounded text-black font-medium hover:bg-zinc-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
