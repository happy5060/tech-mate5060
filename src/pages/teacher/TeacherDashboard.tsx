import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Send,
  Users,
  GraduationCap,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { lessonService } from '../../services/api/lessonService';
import { classroomService } from '../../services/api/classroomService';
import { authService } from '../../services/api/authService';
import { Lesson } from '../../types/lesson';
import { Classroom, PublishedLesson, StudentProgress } from '../../types/classroom';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [published, setPublished] = useState<PublishedLesson[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [studentActivity, setStudentActivity] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [lesList, pubList, clsList, actList] = await Promise.all([
        lessonService.getLessons(),
        classroomService.getAllPublishedLessons(),
        classroomService.getClassrooms(),
        classroomService.getAllStudentProgress()
      ]);
      setLessons(lesList);
      setPublished(pubList);
      setClassrooms(clsList);
      setStudentActivity(actList);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate unique students across classrooms and activity
  const studentIds = new Set<string>();
  studentActivity.forEach((s) => studentIds.add(s.studentId.toLowerCase()));
  classrooms.forEach((c) => {
    if (c.studentCount) {
      for (let i = 0; i < c.studentCount; i++) {
        studentIds.add(`${c.id}-${i}`);
      }
    }
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="glass-card bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-glass border border-indigo-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
              Teacher Workspace
            </span>
            <span className="text-xs text-indigo-200">
              Welcome back, {currentUser?.display_name || 'Educator'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Transform Curriculum into Interactive Packages
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl leading-relaxed">
            Generate 8-section pedagogical lessons with Gemini, add verified YouTube resources, publish to your classroom cohorts, and monitor real-time student progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/teacher/create">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="bg-white text-indigo-900 hover:bg-slate-100 shadow-md font-bold text-xs"
            >
              Create New Lesson
            </Button>
          </Link>
          <Link to="/teacher/classrooms">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Layers className="w-4 h-4" />}
              className="text-white border-white/40 hover:bg-white/10 text-xs font-semibold"
            >
              Classrooms
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Lessons</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{lessons.length}</p>
          <p className="text-[11px] text-slate-400">Created lesson packages</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Published Lessons</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{published.length}</p>
          <p className="text-[11px] text-slate-400">Live in classrooms</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Classrooms</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{classrooms.length}</p>
          <p className="text-[11px] text-slate-400">Active cohorts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{studentIds.size}</p>
          <p className="text-[11px] text-slate-400">Enrolled learners</p>
        </div>
      </div>

      {/* Grid: Recent Lessons & Recent Student Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Lessons */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Recent Lessons</span>
            </h3>
            <Link to="/teacher/lessons" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All ({lessons.length})
            </Link>
          </div>

          {lessons.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No lessons generated yet.</p>
              <Link to="/teacher/create">
                <Button variant="primary" size="sm" className="mt-2 text-xs">
                  Generate Your First Lesson
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.slice(0, 4).map((les) => (
                <div
                  key={les.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {les.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {les.subject} • {les.classLevel} • {les.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/teacher/workspace/${les.id}`}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs"
                    >
                      Workspace
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Student Activity */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Recent Student Activity</span>
            </h3>
            <Link to="/teacher/activity" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All ({studentActivity.length})
            </Link>
          </div>

          {studentActivity.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No student activity recorded yet.</p>
              <p className="text-[11px] text-slate-400">
                Share your Class ID with students to start tracking progress.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentActivity.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{act.studentName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({act.studentId})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Progress: {act.progress_percentage || 0}% • Score:{' '}
                      {act.assessmentScore !== undefined ? `${act.assessmentScore}/10` : '--'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      act.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : act.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
