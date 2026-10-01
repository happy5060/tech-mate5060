import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur-md py-8 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="TechMate Logo"
              className="w-6 h-6 rounded-md object-cover shadow-xs"
            />
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              TechMate
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs font-medium text-slate-500">AI Classroom &amp; Learning Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 bg-indigo-50/70 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini Flash & Supabase Live</span>
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50/70 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-100">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pedagogical Standard Aligned</span>
            </span>
            <span className="text-slate-400">
              Milestone 2.0 (Glassmorphic Polish)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
