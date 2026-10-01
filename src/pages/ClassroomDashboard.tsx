import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Classroom, PublishedLesson, StudentProgress } from '../types/classroom';
import { classroomService } from '../services/api/classroomService';
import { lessonService } from '../services/api/lessonService';
import { QRCodeCard } from '../components/classroom/QRCodeCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Send,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Check,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ClassroomDashboard: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [publishedLessons, setPublishedLessons] = useState<PublishedLesson[]>([]);
  const [studentProgressList, setStudentProgressList] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create classroom modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState('Biology');
  const [newClassLevel, setNewClassLevel] = useState('Grade 8');

  // Share QR modal
  const [activeSharePub, setActiveSharePub] = useState<PublishedLesson | null>(null);

  useEffect(() => {
    loadClassroomData();
  }, []);

  useEffect(() => {
    if (selectedClassroomId) {
      loadClassroomDetails(selectedClassroomId);
    }
  }, [selectedClassroomId]);

  const loadClassroomData = async () => {
    setIsLoading(true);
    try {
      const clsList = await classroomService.getClassrooms();
      setClassrooms(clsList);
      if (clsList.length > 0) {
        setSelectedClassroomId(clsList[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassroomDetails = async (classroomId: string) => {
    const [pubList, progList] = await Promise.all([
      classroomService.getPublishedLessonsByClassroom(classroomId),
      classroomService.getStudentProgressForClassroom(classroomId)
    ]);
    setPublishedLessons(pubList);
    setStudentProgressList(progList);
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const created = await classroomService.createClassroom({
      name: newClassName.trim(),
      subject: newSubject,
      classLevel: newClassLevel
    });

    setClassrooms((prev) => [created, ...prev]);
    setSelectedClassroomId(created.id);
    setNewClassName('');
    setIsCreateOpen(false);
  };

  const handleDeleteClassroom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;
    await classroomService.deleteClassroom(id);
    const updated = classrooms.filter((c) => c.id !== id);
    setClassrooms(updated);
    if (selectedClassroomId === id) {
      setSelectedClassroomId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const selectedClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Teacher Classrooms & Student Progress
            </h1>
            <p className="text-xs text-slate-500">
              Manage student cohorts, publish curriculum packages, and monitor assessment performance.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-xs shadow-indigo-500/20 self-start sm:self-center"
        >
          Create Classroom
        </Button>
      </div>

      {/* Main Grid: Classroom List on Left, Active Classroom View on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Classrooms List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Classrooms ({classrooms.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Click to select</span>
          </div>

          <div className="space-y-2">
            {classrooms.map((cls) => {
              const isSelected = cls.id === selectedClassroomId;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassroomId(cls.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-300 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-50'
                      : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cls.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">
                          {cls.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cls.subject} • {cls.classLevel}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Code: <strong className="font-mono text-slate-700">{cls.code}</strong></span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClassroom(cls.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete Classroom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Classroom Details & Student Progress */}
        <div className="lg:col-span-8 space-y-6">
          {selectedClassroom ? (
            <>
              {/* Classroom Overview Card */}
              <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedClassroom.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                        {selectedClassroom.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedClassroom.subject} • {selectedClassroom.classLevel}
                    </p>
                  </div>

                  <Link to="/workspace">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                      className="text-xs bg-white"
                    >
                      Pick Lesson to Publish
                    </Button>
                  </Link>
                </div>

                {/* Quick Join Code Callout */}
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span className="text-slate-700">
                      Classroom Join Link: <strong className="font-mono">{origin}/join/{selectedClassroom.code}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${origin}/join/${selectedClassroom.code}`);
                      alert('Classroom join link copied to clipboard!');
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Published Lessons Section */}
              <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Published Lessons ({publishedLessons.length})
                  </h3>
                </div>

                {publishedLessons.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No lessons published to this classroom yet. Open any lesson in the workspace and click "Publish to Students".
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {publishedLessons.map((pub) => (
                      <div
                        key={pub.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{pub.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              {pub.accessCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Published on {new Date(pub.publishedAt).toLocaleDateString()} • {pub.resources?.length || 0} Videos Attached
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveSharePub(pub)}
                            leftIcon={<QrCode className="w-3.5 h-3.5 text-indigo-600" />}
                            className="text-xs py-1 h-auto bg-white"
                          >
                            Share / QR
                          </Button>
                          <Link to={`/student/lesson/${pub.accessCode}`} target="_blank">
                            <Button
                              size="sm"
                              variant="ghost"
                              rightIcon={<ExternalLink className="w-3 h-3 text-slate-400" />}
                              className="text-xs py-1 h-auto"
                            >
                              Student View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phase 12: Student Progress Tracking Table */}
              <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Student Progress & Assessments ({studentProgressList.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Real-time cohort roster</span>
                </div>

                {studentProgressList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No student submissions or active sessions recorded yet. Share the QR code or link with your students to begin.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Assessment Score</th>
                          <th className="py-2.5 px-3">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentProgressList.map((prog) => (
                          <tr key={prog.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-800">
                              {prog.studentName}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  prog.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {prog.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {prog.assessmentAttempted ? (
                                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                  {prog.assessmentScore} / {prog.assessmentMaxScore || 5}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Not attempted</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                              {new Date(prog.lastActiveAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500 bg-white/60 rounded-2xl border border-slate-200/80">
              No classrooms created yet. Click "Create Classroom" to get started!
            </div>
          )}
        </div>
      </div>

      {/* Create Classroom Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-glass z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Classroom</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClassroom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8 Biology"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class Level
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Classroom
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share QR Modal */}
      {activeSharePub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActiveSharePub(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-glass z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Share Lesson Package</h3>
              <button onClick={() => setActiveSharePub(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <QRCodeCard
              url={`${origin}/join/${activeSharePub.accessCode}`}
              accessCode={activeSharePub.accessCode}
              title={activeSharePub.title}
              classroomName={activeSharePub.classroomName}
            />
          </div>
        </div>
      )}
    </div>
  );
};
