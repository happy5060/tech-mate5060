import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { classroomService } from '../../services/api/classroomService';
import { lessonService } from '../../services/api/lessonService';
import { StudentProgress, Classroom } from '../../types/classroom';
import { Lesson } from '../../types/lesson';

export const TeacherActivity: React.FC = () => {
  const [activityList, setActivityList] = useState<StudentProgress[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [actList, clsList, lesList] = await Promise.all([
        classroomService.getAllStudentProgress(),
        classroomService.getClassrooms(),
        lessonService.getLessons()
      ]);
      setActivityList(actList);
      setClassrooms(clsList);
      setLessons(lesList);
    } finally {
      setIsLoading(false);
    }
  };

  const getLessonTitle = (lessonId: string) => {
    const found = lessons.find((l) => l.id === lessonId);
    return found ? found.title : 'Photosynthesis';
  };

  const getClassroomName = (classroomId: string) => {
    const found = classrooms.find((c) => c.id === classroomId || c.code === classroomId);
    return found ? found.name : 'Class 8 Biology';
  };

  // Filtered activity
  const filteredActivity = activityList.filter((item) => {
    if (selectedClassroomId !== 'all' && item.classroomId !== selectedClassroomId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchId = item.studentId.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Student Activity & Records</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
              {filteredActivity.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time lesson progress, assessment scores, and completion status for your classroom cohorts.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <select
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white/80 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            STUDENT ACTIVITY
          </h2>
          <span className="text-[11px] text-slate-400">Click any student to view comprehensive breakdown</span>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No student records match your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Classroom</th>
                  <th className="p-4">Lesson</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredActivity.map((act) => (
                  <tr
                    key={act.id}
                    onClick={() => setSelectedStudent(act)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{act.studentName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{act.studentId}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {getClassroomName(act.classroomId)}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {getLessonTitle(act.lessonId)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              act.status === 'Completed'
                                ? 'bg-emerald-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${act.progress_percentage || 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold">
                          {act.progress_percentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {act.assessmentScore !== undefined ? `${act.assessmentScore}/10` : '--'}
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 text-right text-slate-400">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shadow-xs">
                {selectedStudent.studentName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStudent.studentName}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Roll / ID: {selectedStudent.studentId}
                </p>
              </div>
            </div>

            <div className="space-y-3 py-4 border-y border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Classroom:</span>
                <span className="font-semibold text-slate-900">
                  {getClassroomName(selectedStudent.classroomId)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Current Lesson:</span>
                <span className="font-semibold text-slate-900">
                  {getLessonTitle(selectedStudent.lessonId)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Progress:</span>
                <span className="font-bold text-indigo-700">
                  {selectedStudent.progress_percentage || 0}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assessment Score:</span>
                <span className="font-bold text-slate-900">
                  {selectedStudent.assessmentScore !== undefined
                    ? `${selectedStudent.assessmentScore} / ${selectedStudent.assessmentMaxScore || 10}`
                    : 'Not taken yet'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span
                  className={`font-bold ${
                    selectedStudent.status === 'Completed'
                      ? 'text-emerald-700'
                      : selectedStudent.status === 'In Progress'
                      ? 'text-amber-700'
                      : 'text-slate-600'
                  }`}
                >
                  {selectedStudent.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Last Activity:</span>
                <span className="text-slate-700">
                  {new Date(selectedStudent.lastActiveAt).toLocaleString()}
                </span>
              </div>

              {selectedStudent.completedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Completed At:</span>
                  <span className="text-emerald-700">
                    {new Date(selectedStudent.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                Close Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
