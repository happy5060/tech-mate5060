import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublishedLesson, LessonResource } from '../types/classroom';
import { classroomService } from '../services/api/classroomService';
import { StudentTestMode } from '../components/lesson/StudentTestMode';
import { LessonAssistant } from '../components/chat/LessonAssistant';
import { Button } from '../components/ui/Button';
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
  Lock,
  ExternalLink
} from 'lucide-react';

export const StudentLessonView: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  const [published, setPublished] = useState<PublishedLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student info & progress
  const studentName = localStorage.getItem('ai_classroom_student_name') || 'Student';
  const [testScore, setTestScore] = useState<number | null>(null);
  const [isTestModeActive, setIsTestModeActive] = useState(false);

  // AI Assistant drawer
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Active watch video
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      loadLesson(code);
    }
  }, [code]);

  const loadLesson = async (accessCode: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await classroomService.getPublishedLessonByCode(accessCode);
      if (data) {
        setPublished(data);
        if (data.resources?.length > 0 && data.resources[0].video_id) {
          setActiveVideoId(data.resources[0].video_id);
        }
        // Mark progress as In Progress
        await classroomService.recordProgress({
          studentName,
          lessonId: data.lessonId,
          publishedLessonId: data.id,
          classroomId: data.classroomId,
          status: 'In Progress'
        });
      } else {
        setErrorMsg('Lesson not found. Please check your access code.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to load lesson: ' + (err.message || 'Error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestComplete = async (score: number, maxScore: number) => {
    setTestScore(score);
    setIsTestModeActive(false);

    if (published) {
      await classroomService.recordProgress({
        studentName,
        lessonId: published.lessonId,
        publishedLessonId: published.id,
        classroomId: published.classroomId,
        status: 'Completed',
        assessmentAttempted: true,
        assessmentScore: score,
        assessmentMaxScore: maxScore
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading classroom lesson package...</p>
      </div>
    );
  }

  if (errorMsg || !published) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-base font-bold text-slate-900">{errorMsg || 'Lesson not found'}</h2>
        <Link to="/join">
          <Button variant="primary" size="sm">Back to Join Screen</Button>
        </Link>
      </div>
    );
  }

  const { lesson, resources = [] } = published;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Student View Indicator & Breadcrumb */}
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 p-4 sm:p-5 shadow-glass space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/join"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  {published.classroomName || 'Classroom'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Code: {published.accessCode}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 mt-0.5">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {published.allowChat && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAssistantOpen(true)}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                className="shadow-xs shadow-indigo-500/20"
              >
                Ask AI Tutor
              </Button>
            )}
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Student: {studentName}</span>
            <span>•</span>
            <span>{lesson.subject}</span>
            <span>•</span>
            <span>{lesson.classLevel}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Teacher Verified Content (Read Only)</span>
          </div>
        </div>
      </div>

      {/* Main Student Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Modules */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Introduction */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>1. Introduction & Hook</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {lesson.content.introduction}
            </p>
          </div>

          {/* Section 2: Learning Objectives */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>2. What You Will Learn</span>
            </div>
            <ul className="space-y-2">
              {lesson.content.learningObjectives.map((obj: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs sm:text-sm text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Concept Explanation */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>3. Concept Explanation</span>
            </div>
            <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line prose-slate">
              {lesson.content.conceptExplanation}
            </div>
          </div>

          {/* Section 4: Real-World Examples */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>4. Real-World Case Examples</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.content.examples.map((ex: any, i: number) => (
                <div
                  key={ex.id || i}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{ex.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Scenario: </strong>
                    {ex.scenario}
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-xs text-amber-950 font-medium">
                    {ex.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Hands-on Classroom Activity */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-purple-600 font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>5. Classroom Activity: {lesson.content.classroomActivity.title}</span>
            </div>
            <p className="text-xs text-slate-600">
              <strong>Duration: </strong> {lesson.content.classroomActivity.durationMinutes} Minutes
            </p>
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800">Instructions:</h5>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-700">
                {lesson.content.classroomActivity.stepByStepInstructions.map((step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Section 6: Discussion Questions */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-600 font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>6. Questions to Think About</span>
            </div>
            <div className="space-y-3">
              {lesson.content.discussionQuestions.map((dq: any, i: number) => (
                <div
                  key={dq.id || i}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {dq.question}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Assessment Test Mode */}
          {published.allowTestMode && (
            <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>7. Student Assessment</span>
                </div>
                {testScore !== null && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    Score: {testScore} / {lesson.content.assessment.questions.length}
                  </span>
                )}
              </div>

              <StudentTestMode
                questions={lesson.content.assessment.questions}
                onComplete={(score: number, maxScore: number) => handleTestComplete(score, maxScore)}
                onActiveChange={(active: boolean) => setIsTestModeActive(active)}
              />
            </div>
          )}

          {/* Section 8: Conclusion */}
          <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <CheckCheck className="w-4 h-4" />
              <span>8. Lesson Wrap-Up</span>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {lesson.content.conclusion}
            </p>
          </div>
        </div>

        {/* Right Column: Approved Video Player & Resources */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* Approved Learning Videos */}
            <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-4 shadow-glass space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                  <Video className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Approved Learning Videos ({resources.length})
                </h4>
              </div>

              {activeVideoId ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black shadow-md">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0`}
                      title="Lesson Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>

                  {/* Video Select Pills */}
                  {resources.length > 1 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Video:
                      </span>
                      {resources.map((r: LessonResource) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => r.video_id && setActiveVideoId(r.video_id)}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                            activeVideoId === r.video_id
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Play className="w-3 h-3 shrink-0" />
                          <span className="truncate">{r.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No video resources attached to this lesson.
                </p>
              )}
            </div>

            {/* Quick Ask AI Prompt Card */}
            {published.allowChat && (
              <div className="glass-card bg-gradient-to-br from-indigo-50/70 to-purple-50/50 backdrop-blur-xl rounded-2xl border border-indigo-100/70 p-4 shadow-glass space-y-2.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900">Need Help Understanding?</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your AI Learning Assistant is ready to explain any concept simpler or provide step-by-step analogies.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAssistantOpen(true)}
                  leftIcon={<Sparkles className="w-3 h-3" />}
                  className="w-full justify-center text-xs shadow-xs"
                >
                  Open AI Tutor
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Lesson-Aware AI Assistant (Phase 2 & Phase 15) */}
      <LessonAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        lessonContext={{
          subject: lesson.subject,
          topic: lesson.topic,
          classLevel: lesson.classLevel,
          learningObjective: lesson.learningObjective,
          lessonContent: lesson.content,
          resources: published.resources
        }}
        isTestActive={isTestModeActive}
        isStudent={true}
        title="AI Learning Tutor"
      />
    </div>
  );
};
