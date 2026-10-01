import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Lesson,
  LessonSectionKey,
  ExampleItem,
  ClassroomActivity,
  DiscussionQuestion,
  AssessmentQuestion
} from '../types/lesson';
import { lessonService } from '../services/api/lessonService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionCard } from '../components/lesson/SectionCard';
import { AssessmentSection } from '../components/lesson/AssessmentSection';
import { AlignmentPanel } from '../components/lesson/AlignmentPanel';
import { LessonQualityModal, LessonQualityCard } from '../components/lesson/LessonQualityModal';
import { LessonResourcesPanel } from '../components/resources/LessonResourcesPanel';
import { LessonAssistant } from '../components/chat/LessonAssistant';
import { PublishLessonModal } from '../components/classroom/PublishLessonModal';
import {
  ArrowLeft,
  Save,
  Printer,
  Eye,
  FileDown,
  BookOpen,
  Target,
  FileText,
  Lightbulb,
  Users,
  MessageSquare,
  FileCheck2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Share2,
  ShieldCheck,
  Bot,
  Send
} from 'lucide-react';

interface LessonWorkspaceProps {
  onLessonUpdated?: () => void;
}

export const LessonWorkspace: React.FC<LessonWorkspaceProps> = ({ onLessonUpdated }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<LessonSectionKey | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lesson Quality Check state (Phase 1)
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  // Lesson-Aware AI Assistant state (Phase 2 & 15)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Publishing state (Phase 8 & 9)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Per-section editing state
  const [activeEditingSection, setActiveEditingSection] = useState<LessonSectionKey | null>(null);

  // Temporary edit drafts
  const [draftIntro, setDraftIntro] = useState('');
  const [draftObjectives, setDraftObjectives] = useState<string[]>([]);
  const [draftConcept, setDraftConcept] = useState('');
  const [draftExamples, setDraftExamples] = useState<ExampleItem[]>([]);
  const [draftActivity, setDraftActivity] = useState<ClassroomActivity | null>(null);
  const [draftQuestions, setDraftQuestions] = useState<DiscussionQuestion[]>([]);
  const [draftConclusion, setDraftConclusion] = useState('');

  useEffect(() => {
    if (id) {
      loadLesson(id);
    }
  }, [id]);

  const loadLesson = async (lessonId: string) => {
    setIsLoading(true);
    try {
      const data = await lessonService.getLesson(lessonId);
      if (data) {
        setLesson(data);
      } else {
        navigate('/history');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveWholeLesson = async () => {
    if (!lesson) return;
    setIsSaving(true);
    try {
      const updated = await lessonService.saveLesson(lesson);
      setLesson(updated);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('All changes saved successfully');
      if (onLessonUpdated) onLessonUpdated();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPrint = () => {
    if (!lesson) return;
    lessonService.exportLesson(lesson.id, 'print');
  };

  const handleExportJson = () => {
    if (!lesson) return;
    lessonService.exportLesson(lesson.id, 'json');
    showToast('Exported lesson package JSON');
  };

  // Phase 1: AI Lesson Quality Check handler
  const handleRunQualityCheck = async () => {
    if (!lesson) return;
    setIsCheckingQuality(true);
    try {
      const report = await lessonService.checkLessonQuality(lesson.id);
      setLesson((prev) => (prev ? { ...prev, qualityReport: report } : null));
      showToast(
        report.overall_status === 'ready'
          ? 'Quality Check: Lesson is Ready to Teach!'
          : 'Quality Check: Review recommended for flagged sections'
      );
      if (onLessonUpdated) onLessonUpdated();
    } catch (err: any) {
      console.error('Quality check error:', err);
      showToast('Quality check failed: ' + (err.message || 'Error'));
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleOpenQualityModal = () => {
    setIsQualityModalOpen(true);
    if (!lesson?.qualityReport) {
      handleRunQualityCheck();
    }
  };

  // Section-specific regenerate action
  const handleRegenerate = async (sectionKey: LessonSectionKey) => {
    if (!lesson) return;
    setRegeneratingSection(sectionKey);
    try {
      const result = await lessonService.regenerateSection(lesson.id, sectionKey);
      setLesson((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          content: {
            ...prev.content,
            [sectionKey]: result.newContent
          }
        };
      });
      showToast(`Regenerated section: "${sectionKey}" in isolation`);
      if (onLessonUpdated) onLessonUpdated();
    } catch (err: any) {
      console.error('Failed to regenerate section:', err);
      showToast('Failed to regenerate section. Try again.');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const scrollToSection = (sectionKey: string) => {
    const el = document.getElementById(`section-${sectionKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading lesson workspace...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Lesson not found</h2>
        <Link to="/history">
          <Button variant="primary" size="sm">Back to Lesson History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Workspace Header (Sticky Glass Bar) */}
      <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-4 sm:p-5 shadow-glass space-y-4 no-print sticky top-16 z-20 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to="/history"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 shrink-0 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>History</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-200/60 shadow-xs">
                Workspace & Editor
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {lesson.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <Badge variant="brand" size="sm">
                {lesson.subject}
              </Badge>
              <Badge variant="neutral" size="sm">
                <GraduationCap className="w-3 h-3 text-slate-500 mr-1" />
                {lesson.classLevel}
              </Badge>
              <Badge variant="neutral" size="sm">
                <Clock className="w-3 h-3 text-slate-500 mr-1" />
                {lesson.duration}
              </Badge>
              <Badge
                variant={
                  lesson.difficulty === 'Easy'
                    ? 'success'
                    : lesson.difficulty === 'Medium'
                    ? 'brand'
                    : 'warning'
                }
                size="sm"
              >
                {lesson.difficulty}
              </Badge>
              <span className="text-[11px] text-slate-400 pl-1 font-medium">
                Language: {lesson.language} · Style: {lesson.teachingStyle}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {lastSaved && (
              <span className="text-[11px] text-slate-400 hidden lg:inline-block mr-1 font-mono">
                Saved {lastSaved}
              </span>
            )}

            <Link to={`/lesson/${lesson.id}`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                title="Preview read-only lesson format"
                className="bg-white/60 hover:bg-white border-slate-200/80 shadow-xs"
              >
                View
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenQualityModal}
              isLoading={isCheckingQuality}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
              title="Audit lesson against 10 pedagogical standards"
              className={`bg-white/80 hover:bg-white border shadow-xs transition-all ${
                lesson.qualityReport?.overall_status === 'ready'
                  ? 'border-emerald-300 text-emerald-800 hover:border-emerald-400'
                  : lesson.qualityReport?.overall_status === 'needs_review'
                  ? 'border-amber-300 text-amber-800 hover:border-amber-400'
                  : 'border-slate-200/80 text-slate-700'
              }`}
            >
              <span>Check Lesson</span>
              {lesson.qualityReport && (
                <span
                  className={`w-2 h-2 rounded-full ring-2 ring-white ${
                    lesson.qualityReport.overall_status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  title={lesson.qualityReport.overall_status === 'ready' ? 'Ready to Teach' : 'Needs Review'}
                />
              )}
            </Button>

            {/* Phase 2: Ask AI */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssistantOpen(true)}
              leftIcon={<Bot className="w-3.5 h-3.5 text-indigo-600" />}
              className="bg-white/80 hover:bg-white border-slate-200/80 text-slate-700 shadow-xs"
            >
              Ask AI
            </Button>

            {/* Phase 8: Publish to Students */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublishModalOpen(true)}
              leftIcon={<Send className="w-3.5 h-3.5 text-indigo-600" />}
              className="bg-white/80 hover:bg-white border-indigo-200 text-indigo-700 font-semibold shadow-xs"
            >
              Publish to Students
            </Button>

            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPrint}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="bg-white/60 hover:bg-white border-slate-200/80 shadow-xs"
              >
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-glass py-1.5 z-30 w-48 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleExportPrint}
                  className="px-3.5 py-2 text-xs text-left text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-2.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="font-medium">Print Handout (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-2 text-xs text-left text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-2.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span className="font-medium">Download JSON</span>
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveWholeLesson}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="shadow-md shadow-indigo-500/20 active:scale-95"
            >
              Save Lesson
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (2 columns: Sections on Left, Sidebar on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8 Editable Lesson Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Introduction */}
          <SectionCard
            id="section-introduction"
            sectionNumber={1}
            title="Introduction & Curiosity Hook"
            description="Engages students and contextualizes the core lesson topic"
            icon={<BookOpen className="w-4 h-4" />}
            isEditing={activeEditingSection === 'introduction'}
            onStartEdit={() => {
              setDraftIntro(lesson.content.introduction);
              setActiveEditingSection('introduction');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              setLesson({
                ...lesson,
                content: { ...lesson.content, introduction: draftIntro }
              });
              setActiveEditingSection(null);
              showToast('Updated Introduction section');
            }}
            onRegenerate={() => handleRegenerate('introduction')}
            isRegenerating={regeneratingSection === 'introduction'}
            editForm={
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Edit Introduction Paragraph
                </label>
                <textarea
                  rows={4}
                  value={draftIntro}
                  onChange={(e) => setDraftIntro(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            }
          >
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {lesson.content.introduction}
            </p>
          </SectionCard>

          {/* Section 2: Learning Objectives */}
          <SectionCard
            id="section-learningObjectives"
            sectionNumber={2}
            title="Learning Objectives"
            description="Measurable outcomes based on Bloom’s Taxonomy"
            icon={<Target className="w-4 h-4" />}
            isEditing={activeEditingSection === 'learningObjectives'}
            onStartEdit={() => {
              setDraftObjectives([...lesson.content.learningObjectives]);
              setActiveEditingSection('learningObjectives');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              setLesson({
                ...lesson,
                content: { ...lesson.content, learningObjectives: draftObjectives }
              });
              setActiveEditingSection(null);
              showToast('Updated Learning Objectives');
            }}
            onRegenerate={() => handleRegenerate('learningObjectives')}
            isRegenerating={regeneratingSection === 'learningObjectives'}
            editForm={
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Objectives
                </label>
                {draftObjectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const copy = [...draftObjectives];
                        copy[i] = e.target.value;
                        setDraftObjectives(copy);
                      }}
                      className="flex-1 text-xs p-2 rounded border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraftObjectives(draftObjectives.filter((_, idx) => idx !== i))
                      }
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDraftObjectives([...draftObjectives, 'New measurable objective...'])
                  }
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-indigo-600"
                >
                  Add Objective
                </Button>
              </div>
            }
          >
            <ul className="space-y-2.5">
              {lesson.content.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Section 3: Concept Explanation */}
          <SectionCard
            id="section-conceptExplanation"
            sectionNumber={3}
            title="Concept Explanation"
            description="Deep pedagogical breakdown, principles, and notations"
            icon={<FileText className="w-4 h-4" />}
            isEditing={activeEditingSection === 'conceptExplanation'}
            onStartEdit={() => {
              setDraftConcept(lesson.content.conceptExplanation);
              setActiveEditingSection('conceptExplanation');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              setLesson({
                ...lesson,
                content: { ...lesson.content, conceptExplanation: draftConcept }
              });
              setActiveEditingSection(null);
              showToast('Updated Concept Explanation');
            }}
            onRegenerate={() => handleRegenerate('conceptExplanation')}
            isRegenerating={regeneratingSection === 'conceptExplanation'}
            editForm={
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Concept Breakdown (Markdown/Paragraphs)
                </label>
                <textarea
                  rows={8}
                  value={draftConcept}
                  onChange={(e) => setDraftConcept(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            }
          >
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {lesson.content.conceptExplanation}
            </div>
          </SectionCard>

          {/* Section 4: Examples */}
          <SectionCard
            id="section-examples"
            sectionNumber={4}
            title="Real-World Case Examples"
            description="Concrete applications demonstrating the concept"
            icon={<Lightbulb className="w-4 h-4" />}
            isEditing={activeEditingSection === 'examples'}
            onStartEdit={() => {
              setDraftExamples(JSON.parse(JSON.stringify(lesson.content.examples)));
              setActiveEditingSection('examples');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              setLesson({
                ...lesson,
                content: { ...lesson.content, examples: draftExamples }
              });
              setActiveEditingSection(null);
              showToast('Updated Examples');
            }}
            onRegenerate={() => handleRegenerate('examples')}
            isRegenerating={regeneratingSection === 'examples'}
            editForm={
              <div className="space-y-4">
                {draftExamples.map((ex, i) => (
                  <div key={ex.id || i} className="p-3 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Example #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setDraftExamples(draftExamples.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Example Title"
                      value={ex.title}
                      onChange={(e) => {
                        const copy = [...draftExamples];
                        copy[i].title = e.target.value;
                        setDraftExamples(copy);
                      }}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                    <textarea
                      rows={2}
                      placeholder="Scenario"
                      value={ex.scenario}
                      onChange={(e) => {
                        const copy = [...draftExamples];
                        copy[i].scenario = e.target.value;
                        setDraftExamples(copy);
                      }}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                    <textarea
                      rows={2}
                      placeholder="Explanation / Key Takeaway"
                      value={ex.explanation}
                      onChange={(e) => {
                        const copy = [...draftExamples];
                        copy[i].explanation = e.target.value;
                        setDraftExamples(copy);
                      }}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDraftExamples([
                      ...draftExamples,
                      {
                        id: `ex-new-${Date.now()}`,
                        title: 'New Applied Case Example',
                        scenario: 'Contextual description...',
                        explanation: 'Key takeaway...'
                      }
                    ])
                  }
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Example
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.content.examples.map((ex, i) => (
                <div
                  key={ex.id || i}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {ex.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Scenario: </strong>
                    {ex.scenario}
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-indigo-950 font-medium">
                    <span className="text-indigo-700 font-bold">Analysis: </span>
                    {ex.explanation}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Section 5: Classroom Activity */}
          <SectionCard
            id="section-classroomActivity"
            sectionNumber={5}
            title="Hands-on Classroom Activity"
            description="Collaborative engagement matching lesson style and duration"
            icon={<Users className="w-4 h-4" />}
            isEditing={activeEditingSection === 'classroomActivity'}
            onStartEdit={() => {
              setDraftActivity(JSON.parse(JSON.stringify(lesson.content.classroomActivity)));
              setActiveEditingSection('classroomActivity');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              if (draftActivity) {
                setLesson({
                  ...lesson,
                  content: { ...lesson.content, classroomActivity: draftActivity }
                });
              }
              setActiveEditingSection(null);
              showToast('Updated Classroom Activity');
            }}
            onRegenerate={() => handleRegenerate('classroomActivity')}
            isRegenerating={regeneratingSection === 'classroomActivity'}
            editForm={
              draftActivity ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Activity Title
                    </label>
                    <input
                      type="text"
                      value={draftActivity.title}
                      onChange={(e) =>
                        setDraftActivity({ ...draftActivity, title: e.target.value })
                      }
                      className="w-full text-xs p-2 rounded border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        value={draftActivity.durationMinutes}
                        onChange={(e) =>
                          setDraftActivity({
                            ...draftActivity,
                            durationMinutes: parseInt(e.target.value) || 15
                          })
                        }
                        className="w-full text-xs p-2 rounded border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Materials Needed (comma separated)
                    </label>
                    <input
                      type="text"
                      value={draftActivity.materialsNeeded.join(', ')}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          materialsNeeded: e.target.value.split(',').map((s) => s.trim())
                        })
                      }
                      className="w-full text-xs p-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Outcome
                    </label>
                    <textarea
                      rows={2}
                      value={draftActivity.expectedOutcome}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          expectedOutcome: e.target.value
                        })
                      }
                      className="w-full text-xs p-2 rounded border border-slate-300"
                    />
                  </div>
                </div>
              ) : null
            }
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">
                    {lesson.content.classroomActivity.title}
                  </h4>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Estimated Time: {lesson.content.classroomActivity.durationMinutes} Minutes
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Materials Required
                </h5>
                <div className="flex flex-wrap gap-2">
                  {lesson.content.classroomActivity.materialsNeeded.map((mat, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Step-by-Step Instructions
                </h5>
                <ol className="space-y-2">
                  {lesson.content.classroomActivity.stepByStepInstructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-semibold block mb-0.5">Expected Pedagogical Outcome:</span>
                {lesson.content.classroomActivity.expectedOutcome}
              </div>
            </div>
          </SectionCard>

          {/* Section 6: Discussion Questions */}
          <SectionCard
            id="section-discussionQuestions"
            sectionNumber={6}
            title="Discussion & Inquiry Questions"
            description="Open-ended prompts to provoke critical debate and reasoning"
            icon={<MessageSquare className="w-4 h-4" />}
            isEditing={activeEditingSection === 'discussionQuestions'}
            onStartEdit={() => {
              setDraftQuestions(JSON.parse(JSON.stringify(lesson.content.discussionQuestions)));
              setActiveEditingSection('discussionQuestions');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              setLesson({
                ...lesson,
                content: { ...lesson.content, discussionQuestions: draftQuestions }
              });
              setActiveEditingSection(null);
              showToast('Updated Discussion Questions');
            }}
            onRegenerate={() => handleRegenerate('discussionQuestions')}
            isRegenerating={regeneratingSection === 'discussionQuestions'}
            editForm={
              <div className="space-y-4">
                {draftQuestions.map((dq, i) => (
                  <div key={dq.id || i} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Question #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftQuestions(draftQuestions.filter((_, idx) => idx !== i))
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Discussion Question"
                      value={dq.question}
                      onChange={(e) => {
                        const copy = [...draftQuestions];
                        copy[i].question = e.target.value;
                        setDraftQuestions(copy);
                      }}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                    <textarea
                      rows={2}
                      placeholder="Facilitator Guidance"
                      value={dq.facilitatorGuidance}
                      onChange={(e) => {
                        const copy = [...draftQuestions];
                        copy[i].facilitatorGuidance = e.target.value;
                        setDraftQuestions(copy);
                      }}
                      className="w-full text-xs p-1.5 border rounded"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDraftQuestions([
                      ...draftQuestions,
                      {
                        id: `dq-new-${Date.now()}`,
                        question: 'New inquiry prompt...',
                        facilitatorGuidance: 'Teacher guidance for steering discussion...'
                      }
                    ])
                  }
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Question
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {lesson.content.discussionQuestions.map((dq, i) => (
                <div
                  key={dq.id || i}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-subtle space-y-2"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      Q{i + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {dq.question}
                    </p>
                  </div>
                  <div className="pl-8 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">Facilitator Guidance: </span>
                    {dq.facilitatorGuidance}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Section 7: Assessment (MCQ, Short Answer, True/False, Application Based) */}
          <AssessmentSection
            instructions={lesson.content.assessment.instructions}
            questions={lesson.content.assessment.questions}
            isEditable={true}
            onSave={(instructions, questions) => {
              setLesson({
                ...lesson,
                content: {
                  ...lesson.content,
                  assessment: { instructions, questions }
                }
              });
              showToast('Saved Assessment section');
            }}
            onRegenerate={() => handleRegenerate('assessment')}
            isRegenerating={regeneratingSection === 'assessment'}
          />

          {/* Section 8: Conclusion */}
          <SectionCard
            id="section-conclusion"
            sectionNumber={8}
            title="Lesson Conclusion & Next Steps"
            description="Synthesis of takeaways and bridging to future modules"
            icon={<CheckCircle2 className="w-4 h-4" />}
            isEditing={activeEditingSection === 'conclusion'}
            onStartEdit={() => {
              setDraftConclusion(lesson.content.conclusion);
              setActiveEditingSection('conclusion');
            }}
            onCancelEdit={() => setActiveEditingSection(null)}
            onSaveEdit={() => {
              setLesson({
                ...lesson,
                content: { ...lesson.content, conclusion: draftConclusion }
              });
              setActiveEditingSection(null);
              showToast('Updated Conclusion section');
            }}
            onRegenerate={() => handleRegenerate('conclusion')}
            isRegenerating={regeneratingSection === 'conclusion'}
            editForm={
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Conclusion Summary
                </label>
                <textarea
                  rows={4}
                  value={draftConclusion}
                  onChange={(e) => setDraftConclusion(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            }
          >
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {lesson.content.conclusion}
            </p>
          </SectionCard>

          {/* Learning Resources & Videos (Manual Teacher Selection) */}
          <LessonResourcesPanel
            lessonId={lesson.id}
            topic={lesson.topic}
            subject={lesson.subject}
            classLevel={lesson.classLevel}
            learningObjective={lesson.learningObjective}
          />
        </div>

        {/* Right Column: Learning Objective Alignment & Table of Contents */}
        <div className="lg:col-span-4 space-y-6 no-print">
          {/* Dedicated Learning Objective Alignment Panel */}
          <div className="sticky top-40 space-y-6">
            {/* AI Curriculum Quality Check Card (Phase 1) */}
            <LessonQualityCard
              report={lesson.qualityReport}
              isLoading={isCheckingQuality}
              onOpenCheck={handleOpenQualityModal}
            />

            <AlignmentPanel
              lessonId={lesson.id}
              initialAlignments={lesson.alignments}
              onScrollToSection={scrollToSection}
            />

            {/* Quick Section Jump Navigator */}
            <div className="glass-card rounded-2xl border border-white/60 bg-white/75 backdrop-blur-xl p-4 shadow-glass">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Section Navigator</span>
                <span className="text-[10px] font-medium text-slate-400 font-mono">8 Modules</span>
              </h4>
              <nav className="space-y-1 text-xs">
                {[
                  { key: 'introduction', label: '1. Introduction & Hook' },
                  { key: 'learningObjectives', label: '2. Learning Objectives' },
                  { key: 'conceptExplanation', label: '3. Concept Breakdown' },
                  { key: 'examples', label: '4. Case Examples' },
                  { key: 'classroomActivity', label: '5. Hands-on Activity' },
                  { key: 'discussionQuestions', label: '6. Discussion Questions' },
                  { key: 'assessment', label: '7. Assessment & Rubric' },
                  { key: 'conclusion', label: '8. Conclusion & Wrap-up' }
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => scrollToSection(s.key)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-medium">{s.label}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-glass backdrop-blur-xl border border-slate-700/60 text-xs font-medium animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI Lesson Quality Modal (Phase 1) */}
      <LessonQualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        report={lesson.qualityReport || null}
        isLoading={isCheckingQuality}
        onRunCheck={handleRunQualityCheck}
        onRegenerateSection={handleRegenerate}
        regeneratingSection={regeneratingSection}
        onJumpToSection={scrollToSection}
      />

      {/* Lesson-Aware AI Assistant (Phase 2 & Phase 15) */}
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
        isTestActive={false}
        isStudent={false}
        title="Curriculum AI Co-Pilot"
      />

      {/* Publish Lesson Modal (Phase 8 & 9) */}
      <PublishLessonModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        lesson={lesson}
        onPublished={() => {
          showToast('Lesson published to classroom cohort successfully');
          if (onLessonUpdated) onLessonUpdated();
        }}
      />
    </div>
  );
};
