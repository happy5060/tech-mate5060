import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  BookOpen,
  Clock,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  FolderOpen,
  Edit2
} from 'lucide-react';
import { Lesson } from '../types/lesson';
import { lessonService } from '../services/api/lessonService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface DashboardProps {
  dataVersion?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ dataVersion }) => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [dataVersion]);

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const data = await lessonService.getLessons({ sortBy: 'recent' });
      setLessons(data);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return <Badge variant="success" size="sm">Easy</Badge>;
      case 'Medium':
        return <Badge variant="brand" size="sm">Medium</Badge>;
      case 'Hard':
        return <Badge variant="warning" size="sm">Hard</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{difficulty}</Badge>;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Area with Glassmorphism & Atmospheric Depth */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-card border border-white/10">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/15 text-xs font-semibold backdrop-blur-md shadow-subtle">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>TechMate · Pedagogical Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Create a complete lesson in minutes.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Empower your teaching with Generative AI. Specify subject, topic, and learning outcomes to produce structured, 8-section classroom packages that you can review, adapt, and export for your students.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link to="/create">
              <Button
                variant="primary"
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-glow transition-all"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                + Create New Lesson
              </Button>
            </Link>

            <Link to="/history">
              <Button
                variant="glass"
                size="lg"
                className="text-white hover:text-white bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md"
              >
                Browse All Lessons ({lessons.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient background decorative glow circles */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      </section>

      {/* How It Works Section with Frosted Glass Cards */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            A three-step pedagogical workflow designed specifically for classroom educators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-glass-hover transition-all duration-200 space-y-3.5 border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-subtle">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Define your lesson
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your subject, topic, grade level, time duration, and core learning objectives with tailored pedagogical style.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-glass-hover transition-all duration-200 space-y-3.5 border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-700 flex items-center justify-center font-bold text-sm shadow-subtle">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Generate with AI
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generative AI constructs an 8-section pedagogical package complete with hands-on activities, discussion prompts, and diagnostics.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-2xl p-6 hover:shadow-glass-hover transition-all duration-200 space-y-3.5 border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-subtle">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Review and adapt
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refine content directly in the workspace, regenerate individual sections on demand, check objective alignment, and export printable handouts.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Lessons Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Recent Lessons
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your recently created and edited classroom packages
            </p>
          </div>

          {lessons.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-14 text-center glass-panel rounded-2xl">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading your classroom lessons...</p>
          </div>
        )}

        {/* Empty State with Frosted Glass Ring */}
        {!isLoading && lessons.length === 0 && (
          <div className="p-14 text-center glass-panel rounded-3xl border-dashed border-slate-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 mx-auto flex items-center justify-center shadow-subtle border border-indigo-100">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">
                No lessons created yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Ready to prepare your first class? Use our Generative AI wizard to draft your first structured lesson in minutes.
              </p>
            </div>
            <Link to="/create" className="inline-block pt-1">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="shadow-sm hover:shadow-glow"
              >
                + Create Your First Lesson
              </Button>
            </Link>
          </div>
        )}

        {/* Lessons Grid with Glassmorphic Cards */}
        {!isLoading && lessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.slice(0, 6).map((lesson) => (
              <Card
                key={lesson.id}
                hoverEffect
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="brand" size="sm">
                      {lesson.subject}
                    </Badge>
                    {getDifficultyBadge(lesson.difficulty)}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {lesson.learningObjective}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100/80 space-y-3.5">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.classLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      Updated {formatDate(lesson.updatedAt)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/workspace/${lesson.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-slate-100/80 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/lesson/${lesson.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 px-3 py-1 rounded-lg bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/60 shadow-subtle transition-all"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
