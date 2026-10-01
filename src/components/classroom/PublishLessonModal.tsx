import React, { useState, useEffect } from 'react';
import { Classroom, PublishedLesson } from '../../types/classroom';
import { Lesson, LessonQualityReport } from '../../types/lesson';
import { classroomService } from '../../services/api/classroomService';
import { lessonService } from '../../services/api/lessonService';
import { QRCodeCard } from './QRCodeCard';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  Users,
  ShieldCheck,
  RefreshCw,
  Plus,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';

interface PublishLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  onPublished?: (published: PublishedLesson) => void;
}

export const PublishLessonModal: React.FC<PublishLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onPublished
}) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [allowChat, setAllowChat] = useState(true);
  const [allowTestMode, setAllowTestMode] = useState(true);

  // Quality check step
  const [qualityReport, setQualityReport] = useState<LessonQualityReport | null>(
    lesson.qualityReport || null
  );
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  // Publishing state & result
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedLesson, setPublishedLesson] = useState<PublishedLesson | null>(null);

  // Quick new classroom state
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadClassrooms();
      if (!qualityReport) {
        runAutoQualityCheck();
      }
    }
  }, [isOpen]);

  const loadClassrooms = async () => {
    const list = await classroomService.getClassrooms();
    setClassrooms(list);
    if (list.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(list[0].id);
    }
  };

  const runAutoQualityCheck = async () => {
    setIsCheckingQuality(true);
    try {
      const report = await lessonService.checkLessonQuality(lesson.id);
      setQualityReport(report);
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleCreateQuickClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const created = await classroomService.createClassroom({
      name: newClassName.trim(),
      subject: lesson.subject,
      classLevel: lesson.classLevel
    });
    setClassrooms((prev) => [created, ...prev]);
    setSelectedClassroomId(created.id);
    setNewClassName('');
    setIsCreatingClassroom(false);
  };

  const handlePublish = async () => {
    if (!selectedClassroomId) {
      alert('Please select or create a classroom to publish this lesson to.');
      return;
    }

    setIsPublishing(true);
    try {
      const pub = await classroomService.publishLesson({
        lessonId: lesson.id,
        classroomId: selectedClassroomId,
        allowChat,
        allowTestMode
      });
      setPublishedLesson(pub);
      if (onPublished) onPublished(pub);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  const isReady = qualityReport?.overall_status === 'ready';
  const needsReviewCount = qualityReport?.sections.filter((s) => s.status === 'needs_review').length || 0;

  // Origin URL for join link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const joinUrl = publishedLesson ? `${origin}/join/${publishedLesson.accessCode}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-glass overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white/40 to-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {publishedLesson ? 'Lesson Published Successfully!' : 'Publish Lesson to Students'}
              </h3>
              <p className="text-xs text-slate-500">
                {publishedLesson
                  ? 'Students can join via access code or QR scan.'
                  : `Assign "${lesson.title}" to a classroom.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {publishedLesson ? (
            /* Phase 9: Share Link & QR Card */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-sm">Your lesson package is now live!</p>
                  <p className="text-emerald-700 mt-0.5">
                    Students can instantly read the lesson, watch approved videos, ask the AI tutor, and complete the assessment.
                  </p>
                </div>
              </div>

              <QRCodeCard
                url={joinUrl}
                accessCode={publishedLesson.accessCode}
                title={publishedLesson.title}
                classroomName={publishedLesson.classroomName}
              />
            </div>
          ) : (
            /* Publishing Configuration Flow */
            <>
              {/* Quality Audit Notice Banner */}
              <div
                className={`p-4 rounded-2xl border ${
                  isCheckingQuality
                    ? 'bg-slate-50 border-slate-200'
                    : isReady
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isCheckingQuality ? (
                      <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
                    ) : isReady ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Pre-Publish Quality Check
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCheckingQuality
                              ? 'bg-slate-200 text-slate-700'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCheckingQuality ? 'Auditing...' : isReady ? 'Lesson Ready' : 'Review Suggested'}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-slate-700">
                        {isCheckingQuality
                          ? 'Auditing curriculum quality against 10 standards...'
                          : isReady
                          ? 'All 8 curriculum modules meet pedagogical standards for this class level and difficulty.'
                          : `${needsReviewCount} section(s) flagged for review. You may publish now or refine first.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Classroom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Classroom
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingClassroom(!isCreatingClassroom)}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Classroom</span>
                  </button>
                </div>

                {isCreatingClassroom ? (
                  <form
                    onSubmit={handleCreateQuickClassroom}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <input
                      type="text"
                      required
                      placeholder="e.g. Class 8 Biology Section B"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCreatingClassroom(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" size="sm">
                        Save Classroom
                      </Button>
                    </div>
                  </form>
                ) : (
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.classLevel} • {c.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Student Experience Settings */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Student Interactive Permissions
                </h4>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowChat}
                    onChange={(e) => setAllowChat(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    Enable <strong>AI Learning Assistant</strong> ([ Ask AI ]) for students
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowTestMode}
                    onChange={(e) => setAllowTestMode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    Enable interactive <strong>Assessment Test Mode</strong> with score tracking
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {publishedLesson
              ? 'Lesson code is permanently active for your students.'
              : 'Teacher remains in full control. Existing lessons are never duplicated unnecessarily.'}
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {publishedLesson ? 'Done' : 'Cancel'}
            </Button>

            {!publishedLesson && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                isLoading={isPublishing}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Publish to Students
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
