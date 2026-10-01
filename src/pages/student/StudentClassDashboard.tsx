import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { classroomService } from '../../services/api/classroomService';
import { Classroom, PublishedLesson, StudentProgress } from '../../types/classroom';

export const StudentClassDashboard: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [lessons, setLessons] = useState<PublishedLesson[]>([]);
  const [progressList, setProgressList] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const studentName = localStorage.getItem('ai_classroom_student_name') || 'Student';
  const studentId = localStorage.getItem('ai_classroom_student_id') || 'STU-01';

  useEffect(() => {
    if (classId) {
      loadClassData(classId);
    }
  }, [classId]);

  const loadClassData = async (targetId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const cls = await classroomService.getClassroom(targetId);
      if (!cls) {
        setErrorMsg(`Classroom not found.`);
        return;
      }
      setClassroom(cls);

      const [published, allProgress] = await Promise.all([
        classroomService.getPublishedLessonsByClassroom(cls.id),
        classroomService.getAllStudentProgress()
      ]);
      setLessons(published);

      // Student's progress for this classroom
      const myProgress = allProgress.filter(
        (p) =>
          p.classroomId === cls.id ||
          p.studentName.toLowerCase() === studentName.toLowerCase()
      );
      setProgressList(myProgress);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load classroom data');
    } finally {
      setIsLoading(false);
    }
  };

  const getLessonStatus = (lessonId: string) => {
    const p = progressList.find((prog) => prog.lessonId === lessonId);
    return p ? p.status : 'Not Started';
  };

  const completedCount = lessons.filter(
    (l) => getLessonStatus(l.lessonId) === 'Completed'
  ).length;

  const overallProgressPercentage =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Entering classroom...</p>
      </div>
    );
  }

  if (errorMsg || !classroom) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-base font-bold text-slate-900">{errorMsg || 'Classroom not found'}</h2>
        <Link to="/student/join">
          <Button variant="primary" size="sm">Back to Join Screen</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 p-6 sm:p-8 shadow-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider font-mono">
                {classroom.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {classroom.subject.toUpperCase()} — {classroom.classLevel.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {classroom.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Teacher: <span className="text-slate-800 font-bold">{classroom.teacherName || 'Ananya Sharma'}</span>
            </p>
          </div>

          <div className="text-right sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">Student</span>
            <p className="text-sm font-bold text-slate-900">{studentName}</p>
            <span className="text-[10px] text-slate-400 font-mono">({studentId})</span>
          </div>
        </div>

        {/* Course Progress Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Course Completion</span>
            <span className="font-bold text-indigo-700">
              {completedCount} of {lessons.length} Lessons Completed ({overallProgressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Published Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Published Lessons ({lessons.length})
          </h2>
          <span className="text-xs text-slate-400">Step through lessons in sequence</span>
        </div>

        {lessons.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-subtle space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Lessons Published Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your teacher has not published lessons to this classroom cohort yet. Please check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((pub, idx) => {
              const status = getLessonStatus(pub.lessonId);
              const isCompleted = status === 'Completed';
              const isInProgress = status === 'In Progress';

              return (
                <div
                  key={pub.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {pub.title}
                        </h3>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>In Progress</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {pub.subject} • {pub.classLevel} • {pub.resources?.length || 0} Video Resources
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Link
                      to={`/student/class/${classroom.id}/lesson/${pub.lessonId}`}
                    >
                      <Button
                        variant={isCompleted ? 'outline' : 'primary'}
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="text-xs font-semibold shadow-xs"
                      >
                        {isCompleted ? 'Review Lesson' : isInProgress ? 'Continue Lesson' : 'Start Lesson'}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
