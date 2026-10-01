import React from 'react';
import {
  LessonSectionKey,
  LessonQualityReport
} from '../../types/lesson';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  X,
  ExternalLink,
  BookOpen,
  Target,
  FileText,
  Lightbulb,
  Users,
  MessageSquare,
  HelpCircle,
  CheckCheck
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LessonQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LessonQualityReport | null;
  isLoading: boolean;
  onRunCheck: () => Promise<void>;
  onRegenerateSection: (sectionKey: LessonSectionKey) => Promise<void>;
  regeneratingSection: LessonSectionKey | null;
  onJumpToSection: (sectionKey: LessonSectionKey) => void;
}

const SECTION_ICONS: Record<LessonSectionKey, React.ReactNode> = {
  introduction: <BookOpen className="w-4 h-4 text-indigo-600" />,
  learningObjectives: <Target className="w-4 h-4 text-emerald-600" />,
  conceptExplanation: <FileText className="w-4 h-4 text-blue-600" />,
  examples: <Lightbulb className="w-4 h-4 text-amber-600" />,
  classroomActivity: <Users className="w-4 h-4 text-purple-600" />,
  discussionQuestions: <MessageSquare className="w-4 h-4 text-cyan-600" />,
  assessment: <HelpCircle className="w-4 h-4 text-rose-600" />,
  conclusion: <CheckCheck className="w-4 h-4 text-emerald-600" />
};

export const LessonQualityModal: React.FC<LessonQualityModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onRunCheck,
  onRegenerateSection,
  regeneratingSection,
  onJumpToSection
}) => {
  if (!isOpen) return null;

  const isReady = report?.overall_status === 'ready';
  const needsReviewCount = report?.sections.filter((s) => s.status === 'needs_review').length || 0;
  const goodCount = report?.sections.filter((s) => s.status === 'good').length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-glass overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white/40 to-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 ring-4 ring-indigo-50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  AI Lesson Quality Check
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100/70 text-indigo-700">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini Evaluated
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Audited against 10 explicit pedagogical & curriculum criteria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRunCheck}
              disabled={isLoading}
              title="Re-run Quality Check"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl border border-slate-200/80 bg-white/70 shadow-xs active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Checking...' : 'Re-check'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isLoading ? (
            /* Loading State */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-white">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Evaluating Lesson Package
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gemini is auditing Bloom’s objective alignment, conceptual clarity, class-level appropriateness, and assessment validity without arbitrary scoring...
                </p>
              </div>
            </div>
          ) : !report ? (
            /* Empty State: Ready to check */
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Ready for Quality Audit
                </h4>
                <p className="text-xs text-slate-500">
                  Run an instant AI quality review across all 8 modules to ensure pedagogical rigor before publishing to students.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={onRunCheck}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="shadow-md shadow-indigo-500/20"
              >
                Check Lesson Quality
              </Button>
            </div>
          ) : (
            /* Report Results */
            <>
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isReady
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isReady
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      }`}
                    >
                      {isReady ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Overall Curriculum Status
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isReady ? 'Ready' : 'Needs Review'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isReady
                          ? 'Ready for Classroom Delivery'
                          : `${needsReviewCount} ${needsReviewCount === 1 ? 'Section Requires' : 'Sections Require'} Review`}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {report.summary ||
                          (isReady
                            ? 'All modules satisfy pedagogical standards for learning objectives, grade-level vocabulary, and assessment alignment.'
                            : 'Adjust the flagged sections below to ensure comprehensive pedagogical alignment.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold">
                    <span className="px-2 py-1 rounded-lg bg-emerald-100/80 text-emerald-800">
                      {goodCount} Good
                    </span>
                    {needsReviewCount > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-amber-100/80 text-amber-800">
                        {needsReviewCount} Needs Review
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluated Sections List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Evaluated Curriculum Modules ({report.sections.length})
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Strict binary pedagogical status (No arbitrary %)
                  </span>
                </div>

                <div className="space-y-2.5">
                  {report.sections.map((sec) => {
                    const isGood = sec.status === 'good';
                    const isRegeneratingThis = regeneratingSection === sec.section;

                    return (
                      <div
                        key={sec.section}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isGood
                            ? 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                            : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Icon, Title, Status */}
                          <div className="flex items-start sm:items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                              {SECTION_ICONS[sec.section] || <BookOpen className="w-4 h-4 text-slate-500" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {sec.sectionTitle || sec.section}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isGood
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {isGood ? (
                                    <>
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      Good
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      Needs Review
                                    </>
                                  )}
                                </span>
                              </div>
                              {/* Reason */}
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {sec.reason}
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {!isGood && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onRegenerateSection(sec.section)}
                                isLoading={isRegeneratingThis}
                                leftIcon={<RefreshCw className="w-3 h-3 text-amber-600" />}
                                className="border-amber-300 text-amber-800 hover:bg-amber-100/70 text-xs py-1 px-2.5 h-auto font-medium"
                              >
                                {isRegeneratingThis ? 'Regenerating...' : 'Regenerate Section'}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                onJumpToSection(sec.section);
                                onClose();
                              }}
                              rightIcon={<ExternalLink className="w-3 h-3 text-slate-400" />}
                              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 text-xs py-1 px-2.5 h-auto font-medium"
                            >
                              Jump to Section
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 text-[11px] text-center sm:text-left">
            <span className="font-semibold text-slate-700">Teacher Control:</span> AI evaluations are advisory recommendations. Your lesson content is never automatically overwritten.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Sidebar Card for Workspace
 */
interface LessonQualityCardProps {
  report: LessonQualityReport | null | undefined;
  isLoading: boolean;
  onOpenCheck: () => void;
}

export const LessonQualityCard: React.FC<LessonQualityCardProps> = ({
  report,
  isLoading,
  onOpenCheck
}) => {
  const isReady = report?.overall_status === 'ready';
  const hasReport = Boolean(report);
  const needsReviewCount = report?.sections.filter((s) => s.status === 'needs_review').length || 0;

  return (
    <div className="glass-card rounded-2xl border border-white/60 bg-white/75 backdrop-blur-xl shadow-glass overflow-hidden p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white shadow-sm ring-2 ring-indigo-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Curriculum Quality Check
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              10-point pedagogical audit
            </p>
          </div>
        </div>

        {hasReport && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isReady
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isReady ? 'Ready' : 'Needs Review'}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {hasReport ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {report?.summary || (isReady ? 'Lesson is ready for classroom instruction.' : `${needsReviewCount} sections flagged for review.`)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {report?.sections.filter((s) => s.status === 'good').length} Good
              </span>
              <span>•</span>
              <span className={`flex items-center gap-1 ${needsReviewCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                {needsReviewCount > 0 && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                {needsReviewCount} Needs Review
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 leading-relaxed">
            Verify lesson objective alignment, grade-level vocabulary, and assessment coverage with AI.
          </p>
        )}

        <Button
          variant={hasReport && !isReady ? 'outline' : 'primary'}
          size="sm"
          onClick={onOpenCheck}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          className="w-full text-xs py-2 shadow-xs justify-center"
        >
          {hasReport ? 'View Quality Audit' : 'Check Lesson'}
        </Button>
      </div>
    </div>
  );
};
