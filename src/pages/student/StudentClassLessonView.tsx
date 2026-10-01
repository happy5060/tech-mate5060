import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublishedLesson, LessonResource, Classroom } from '../../types/classroom';
import { classroomService } from '../../services/api/classroomService';
import { lessonService } from '../../services/api/lessonService';
import { videoResourceService } from '../../services/api/videoResourceService';
import { StudentTestMode } from '../../components/lesson/StudentTestMode';
import { LessonAssistant } from '../../components/chat/LessonAssistant';
import { Button } from '../../components/ui/Button';
import {
  BookOpen,
  Target,
  FileText,
  Lightbulb,
  Users,
  MessageSquare,
  HelpCircle,
  CheckCheck,
  Video,
  Play,
  Bot,
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ExternalLink,
  X
} from 'lucide-react';
import { Lesson } from '../../types/lesson';

export const StudentClassLessonView: React.FC = () => {
  const { classId, lessonId, code } = useParams<{ classId?: string; lessonId?: string; code?: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [publishedLesson, setPublishedLesson] = useState<PublishedLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student Identity
  const studentName = localStorage.getItem('ai_classroom_student_name') || 'Student';
  const studentId = localStorage.getItem('ai_classroom_student_id') || 'STU-01';

  // Test mode & score
  const [isTestModeActive, setIsTestModeActive] = useState(false);
  const [testScore, setTestScore] = useState<number | null>(null);

  // AI assistant drawer
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Active watch video
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [classId, lessonId, code]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let targetLesson: Lesson | null = null;
      let targetClassroom: Classroom | null = null;
      let targetResources: LessonResource[] = [];

      if (code) {
        // Legacy code-based lookup
        const pub = await classroomService.getPublishedLessonByCode(code);
        if (pub) {
          setPublishedLesson(pub);
          targetLesson = pub.lesson;
          targetResources = pub.resources || [];
          if (pub.classroomId) {
            targetClassroom = await classroomService.getClassroom(pub.classroomId);
          }
        }
      } else if (lessonId) {
        targetLesson = await lessonService.getLesson(lessonId);
        targetResources = await videoResourceService.getLessonResources(lessonId);

        if (classId) {
          targetClassroom = await classroomService.getClassroom(classId);
          const allPubs = await classroomService.getPublishedLessonsByClassroom(classId);
          const pub = allPubs.find((p) => p.lessonId === lessonId);
          if (pub) setPublishedLesson(pub);
        }
      }

      if (!targetLesson) {
        setErrorMsg('Lesson package not found. Please verify the URL or ask your teacher.');
        return;
      }

      setLesson(targetLesson);
      setClassroom(targetClassroom);
      setResources(targetResources);

      // Record 'In Progress'
      await classroomService.recordProgress({
        studentName,
        studentId,
        lessonId: targetLesson.id,
        publishedLessonId: publishedLesson?.id,
        classroomId: targetClassroom?.id || classId || '',
        status: 'In Progress',
        progress_percentage: 60
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load lesson package');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestComplete = async (score: number, maxScore: number) => {
    setTestScore(score);
    setIsTestModeActive(false);

    if (lesson) {
      // 1. Record completed progress
      await classroomService.recordProgress({
        studentName,
        studentId,
        lessonId: lesson.id,
        publishedLessonId: publishedLesson?.id,
        classroomId: classroom?.id || classId || '',
        status: 'Completed',
        progress_percentage: 100,
        assessmentAttempted: true,
        assessmentScore: score,
        assessmentMaxScore: maxScore
      });

      // 2. Record assessment attempt
      await classroomService.recordAssessmentAttempt({
        studentName,
        studentId,
        classroomId: classroom?.id || classId || '',
        lessonId: lesson.id,
        publishedLessonId: publishedLesson?.id,
        score,
        totalQuestions: maxScore
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Opening curriculum package...</p>
      </div>
    );
  }

  if (errorMsg || !lesson) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-base font-bold text-slate-900">{errorMsg || 'Lesson not found'}</h2>
        <Link to={classId ? `/student/class/${classId}` : '/student/join'}>
          <Button variant="primary" size="sm">Back to Classroom</Button>
        </Link>
      </div>
    );
  }

  const { content } = lesson;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Banner & Navigation */}
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 p-4 sm:p-6 shadow-glass space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={classroom ? `/student/class/${classroom.id}` : '/student/join'}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Back to Class"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 font-mono">
                  {classroom?.code || 'CLASS'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {classroom?.name || lesson.subject}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssistantOpen(true)}
              leftIcon={<Bot className="w-4 h-4 text-indigo-600" />}
              className="text-xs font-semibold bg-indigo-50/70 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Learning Objectives */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center gap-2.5 text-indigo-600">
          <Target className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Learning Objectives
          </h2>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
          {content.learningObjectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Introduction */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center gap-2.5 text-indigo-600">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Introduction & Hook
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {content.introduction}
        </p>
      </div>

      {/* 3. Concept Explanation */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center gap-2.5 text-indigo-600">
          <FileText className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Concept Explanation
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
          {content.conceptExplanation}
        </div>
      </div>

      {/* 4. Examples */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-600">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Real-World Examples
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.examples.map((ex, i) => (
            <div key={ex.id || i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Example {i + 1}
              </span>
              <h3 className="text-xs font-bold text-slate-900">{ex.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{ex.scenario}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{ex.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Classroom Activity */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <Users className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Classroom Activity
            </h2>
          </div>
          {content.classroomActivity.durationMinutes && (
            <span className="text-xs text-slate-500 font-medium">
              Duration: {content.classroomActivity.durationMinutes} mins
            </span>
          )}
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
          <h3 className="text-xs sm:text-sm font-bold text-indigo-950">
            {content.classroomActivity.title}
          </h3>
          {content.classroomActivity.stepByStepInstructions && (
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-5">
              {content.classroomActivity.stepByStepInstructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          )}
          {content.classroomActivity.expectedOutcome && (
            <p className="text-xs text-indigo-900 font-semibold pt-1">
              Expected Outcome: {content.classroomActivity.expectedOutcome}
            </p>
          )}
        </div>
      </div>

      {/* 6. Discussion Questions */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-600">
          <MessageSquare className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Discussion Questions
          </h2>
        </div>
        <div className="space-y-2.5">
          {content.discussionQuestions.map((dq, i) => (
            <div key={dq.id || i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                Q{i + 1}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800">{dq.question}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Approved YouTube Resources */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <Video className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Teacher-Approved YouTube Resources ({resources.length})
          </h2>
        </div>

        {resources.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No supplementary video resources added to this lesson package.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 group"
              >
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                  <img
                    src={res.thumbnail || `https://img.youtube.com/vi/${res.video_id}/hqdefault.jpg`}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveVideo({ id: res.video_id || '', title: res.title })}
                    className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white gap-1.5 text-xs font-bold"
                  >
                    <Play className="w-7 h-7 fill-white" />
                    <span>Watch Video</span>
                  </button>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{res.title}</h3>
                  <p className="text-[10px] text-slate-400">{res.channel || 'YouTube'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Assessment (Interactive MCQ Test Mode) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-600">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Interactive Assessment
            </h2>
          </div>
          {testScore !== null && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Score Recorded: {testScore} / {content.assessment.questions.length}</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600">
          {content.assessment.instructions || 'Test your understanding with these practice questions.'}
        </p>

        {!isTestModeActive ? (
          <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center space-y-3">
            <p className="text-xs font-semibold text-emerald-950">
              {testScore !== null
                ? `You have completed this assessment with a score of ${testScore} / ${content.assessment.questions.length}. You may retake it anytime.`
                : `Ready to test your comprehension? There are ${content.assessment.questions.length} questions in this module.`}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsTestModeActive(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              {testScore !== null ? 'Retake Assessment' : 'Start Assessment Test'}
            </Button>
          </div>
        ) : (
          <StudentTestMode
            questions={content.assessment.questions}
            instructions={content.assessment.instructions}
            onComplete={handleTestComplete}
            onExit={() => setIsTestModeActive(false)}
          />
        )}
      </div>

      {/* 9. Conclusion */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center gap-2.5 text-indigo-600">
          <CheckCheck className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Conclusion & Summary
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {content.conclusion}
        </p>
      </div>

      {/* Embedded Watch Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl shadow-modal border border-slate-700 w-full max-w-3xl overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <h3 className="text-sm font-bold truncate pr-6">{activeVideo.title}</h3>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Lesson-Aware AI Assistant Drawer */}
      <LessonAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        lessonContext={{
          subject: lesson.subject,
          topic: lesson.topic,
          classLevel: lesson.classLevel,
          learningObjective: lesson.learningObjective,
          lessonContent: lesson.content
        }}
        isTestActive={isTestModeActive}
        isStudent={true}
        title="Classroom AI Assistant"
      />
    </div>
  );
};
