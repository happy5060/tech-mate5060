import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Bot,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const PortalLanding: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-5xl space-y-12 text-center">
        {/* Hero Branding */}
        <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-300">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="TechMate Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-3xl shadow-xl shadow-indigo-300/40 hover:scale-105 transition-all duration-300 ring-4 ring-white"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-subtle">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>TechMate — Complete AI Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            TechMate
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Your all-in-one AI classroom companion. Generate pedagogical curriculum packages with Gemini Flash, manage student cohorts, curate verified video resources, and deliver lesson-aware learning experiences.
          </p>
        </div>

        {/* Portal Selection Section */}
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Choose your portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* 1. MASTER ADMIN */}
            <Link
              to="/admin/login"
              className="group glass-card bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-3xl p-7 border border-white/80 shadow-glass hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Master Admin
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Institutional governance, manage teacher accounts, view schoolwide metrics, and audit curriculum activity.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Teacher Account Provisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Real Database Metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Role-Based Supabase Access</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-4 border-t border-slate-100 group-hover:text-indigo-600">
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. TEACHER */}
            <Link
              to="/teacher/login"
              className="group glass-card bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-3xl p-7 border border-white/80 shadow-glass hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1 relative ring-2 ring-indigo-500/20"
            >
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                Primary Portal
              </div>

              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Teacher Portal
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                      Educator
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Generate 8-section lessons via Gemini, add YouTube resources manually, create cohorts, publish packages, and review student progress.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Gemini Curriculum Generator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Classroom ID & QR Distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Student Performance Records</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-4 border-t border-slate-100 group-hover:text-indigo-600">
                <span>Enter Teacher Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. STUDENT */}
            <Link
              to="/student/join"
              className="group glass-card bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-3xl p-7 border border-white/80 shadow-glass hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Student Portal
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                      Learner
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Join with your Class ID without an account. Access published lessons, watch approved videos, ask the AI assistant, and take quizzes.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Join via Class ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lesson-Aware AI Co-Pilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Interactive Assessment Test Mode</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-4 border-t border-slate-100 group-hover:text-emerald-600">
                <span>Join with Class ID</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
