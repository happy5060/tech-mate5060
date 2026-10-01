import React, { useState } from 'react';
import { SectionAlignment } from '../../types/lesson';
import { CheckCircle2, AlertCircle, RefreshCw, Sparkles, Bot, ShieldCheck } from 'lucide-react';
import { lessonService } from '../../services/api/lessonService';

interface AlignmentPanelProps {
  lessonId: string;
  initialAlignments: SectionAlignment[];
  onScrollToSection?: (sectionKey: string) => void;
}

export const AlignmentPanel: React.FC<AlignmentPanelProps> = ({
  lessonId,
  initialAlignments,
  onScrollToSection,
}) => {
  const [alignments, setAlignments] = useState<SectionAlignment[]>(initialAlignments);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('Just now');

  const handleRecheck = async () => {
    setIsChecking(true);
    try {
      const refreshed = await lessonService.checkAlignment(lessonId);
      setAlignments(refreshed);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setIsChecking(false);
    }
  };

  const alignedCount = alignments.filter((a) => a.status === 'aligned').length;
  const reviewCount = alignments.filter((a) => a.status === 'needs_review').length;

  return (
    <div className="glass-card rounded-2xl border border-white/60 bg-white/75 backdrop-blur-xl shadow-glass overflow-hidden flex flex-col h-full transition-all duration-300">
      {/* Header - AI Assistant Theme */}
      <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-indigo-50/70 via-white/50 to-purple-50/50 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white shadow-sm ring-2 ring-indigo-100">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Objective Alignment
                </h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100/70 text-indigo-700">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Pedagogical consistency monitor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRecheck}
            disabled={isChecking}
            title="Re-run Alignment Analysis"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white/80 rounded-xl border border-slate-200/70 bg-white/50 shadow-xs hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Status Pills */}
        <div className="mt-3 flex items-center gap-2 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{alignedCount} Aligned</span>
          </div>
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 border border-amber-500/20 shadow-xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">{reviewCount} Needs Review</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 text-slate-600 border border-slate-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Alignment</span>
            </div>
          )}
        </div>
      </div>

      {/* Alignment Items List */}
      <div className="divide-y divide-slate-100/80 flex-1 overflow-y-auto max-h-[600px] p-2 space-y-1">
        {alignments.map((item) => {
          const isAligned = item.status === 'aligned';

          return (
            <div
              key={item.sectionKey}
              onClick={() => onScrollToSection && onScrollToSection(item.sectionKey)}
              className="p-3 rounded-xl hover:bg-indigo-50/40 border border-transparent hover:border-indigo-100 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {item.sectionTitle}
                </span>

                {isAligned ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                    <span className="text-[10px]">✓</span>
                    <span>Aligned</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                    <span className="text-[10px]">○</span>
                    <span>Needs Review</span>
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed font-normal">
                {item.note}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer Informative Note */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between gap-2 backdrop-blur-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Synchronized with Gemini
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          {lastChecked}
        </span>
      </div>
    </div>
  );
};
