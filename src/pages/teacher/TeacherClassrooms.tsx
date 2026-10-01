import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Copy,
  QrCode,
  ExternalLink,
  BookOpen,
  Users,
  CheckCircle2,
  X,
  Share2,
  ArrowRight,
  GraduationCap,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { classroomService } from '../../services/api/classroomService';
import { authService } from '../../services/api/authService';
import { Classroom, PublishedLesson, StudentClassroomMembership } from '../../types/classroom';

export const TeacherClassrooms: React.FC = () => {
  const navigate = useNavigate();
  const { id: selectedClassId } = useParams<{ id: string }>();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [publishedLessons, setPublishedLessons] = useState<PublishedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Classroom Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('Biology');
  const [classLevel, setClassLevel] = useState('Grade 9');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Modal
  const [qrModalClass, setQrModalClass] = useState<Classroom | null>(null);

  // Delete Classroom
  const [classPendingDelete, setClassPendingDelete] = useState<Classroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selected Classroom Detail view (if /teacher/classrooms/:id)
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [activeMembers, setActiveMembers] = useState<StudentClassroomMembership[]>([]);
  const [activePublished, setActivePublished] = useState<PublishedLesson[]>([]);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadClassrooms();
  }, [selectedClassId]);

  const loadClassrooms = async () => {
    setIsLoading(true);
    try {
      const [clsList, pubList] = await Promise.all([
        classroomService.getClassrooms(),
        classroomService.getAllPublishedLessons()
      ]);
      setClassrooms(clsList);
      setPublishedLessons(pubList);

      if (selectedClassId) {
        const found = clsList.find(
          (c) => c.id === selectedClassId || c.code.toLowerCase() === selectedClassId.toLowerCase()
        );
        if (found) {
          setActiveClassroom(found);
          const [mems, pubs] = await Promise.all([
            classroomService.getClassroomMembers(found.id),
            classroomService.getPublishedLessonsByClassroom(found.id)
          ]);
          setActiveMembers(mems);
          setActivePublished(pubs);
        }
      } else {
        setActiveClassroom(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setIsSubmitting(true);
    try {
      const newClass = await classroomService.createClassroom({
        name: className.trim(),
        subject: subject.trim(),
        classLevel: classLevel.trim(),
        description: description.trim(),
        teacherName: currentUser?.display_name || 'Ananya Sharma',
        teacherId: currentUser?.id
      });

      setClassrooms((prev) => [newClass, ...prev]);
      setClassName('');
      setDescription('');
      setIsCreateOpen(false);
      showToast(`Classroom "${newClass.name}" created with ID: ${newClass.code}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create classroom');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyClassId = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied Class ID: ${code}`);
  };

  const handleCopyJoinLink = (code: string) => {
    const origin = window.location.origin;
    const link = `${origin}/student/join?class=${code}`;
    navigator.clipboard.writeText(link);
    showToast(`Copied Student Join Link: ${link}`);
  };

  const handleDeleteClassroom = async () => {
    if (!classPendingDelete) return;
    const deletedId = classPendingDelete.id;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await classroomService.deleteClassroom(deletedId);
      setClassrooms((prev) => prev.filter((c) => c.id !== deletedId));
      showToast(`Classroom "${classPendingDelete.name}" deleted successfully.`);
      setClassPendingDelete(null);
      if (selectedClassId === deletedId) {
        navigate('/teacher/classrooms');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete classroom');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Classroom Management</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              {classrooms.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create classrooms, generate unique student Class IDs, and distribute join links & QR codes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-xs shadow-indigo-500/20"
        >
          Create Classroom
        </Button>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-glass backdrop-blur-xl border border-slate-700/60 text-xs font-medium animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* If viewing a single classroom detail */}
      {activeClassroom ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <Link
              to="/teacher/classrooms"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              ← Back to All Classrooms
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyClassId(activeClassroom.code)}
                leftIcon={<Copy className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Copy ID: {activeClassroom.code}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyJoinLink(activeClassroom.code)}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Copy Join Link
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setQrModalClass(activeClassroom)}
                leftIcon={<QrCode className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Show QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteError(null);
                  setClassPendingDelete(activeClassroom);
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              >
                Delete Class
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                  Class ID: {activeClassroom.code}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{activeClassroom.name}</h2>
                <p className="text-xs text-slate-500">
                  {activeClassroom.subject} • {activeClassroom.classLevel} • Instructor:{' '}
                  {activeClassroom.teacherName || 'Ananya Sharma'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-24">
                  <p className="text-xl font-bold text-slate-900">
                    {activeMembers.length || activeClassroom.studentCount || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Students</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-24">
                  <p className="text-xl font-bold text-slate-900">{activePublished.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Published</p>
                </div>
              </div>
            </div>

            {/* Published Lessons in this class */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Published Lessons ({activePublished.length})
              </h3>
              {activePublished.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No lessons published to this classroom yet. Go to your lessons to publish one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePublished.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{pub.title}</h4>
                        <p className="text-[11px] text-slate-400">Published on {new Date(pub.publishedAt).toLocaleDateString()}</p>
                      </div>
                      <Link
                        to={`/teacher/workspace/${pub.lessonId}`}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        Edit →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enrolled Students in this class */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Enrolled Students ({activeMembers.length})
              </h3>
              {activeMembers.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No students have joined with Class ID &quot;{activeClassroom.code}&quot; yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {activeMembers.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">{m.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({m.student_identifier})</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Joined {new Date(m.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Classroom Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.map((cls) => {
            const classPublished = publishedLessons.filter((p) => p.classroomId === cls.id);
            return (
              <div
                key={cls.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100 tracking-wider">
                      {cls.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {cls.classLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-slate-500">{cls.subject}</p>

                  {cls.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {cls.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {cls.studentCount || 0} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {classPublished.length} Published
                    </span>
                  </div>

                  {/* Actions: [Open] [Copy Class ID] [Copy Join Link] [Show QR] */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/teacher/classrooms/${cls.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyClassId(cls.code)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Class ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyJoinLink(cls.code)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Join Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQrModalClass(cls)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 text-xs font-semibold"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setClassPendingDelete(cls);
                      }}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-semibold col-span-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CLASSROOM MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Classroom</h3>
                <p className="text-xs text-slate-500">
                  A unique student join ID (e.g. BIO9A7K) will be generated automatically
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 9 Biology Section B"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biology"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade / Class Level
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 9"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Course summary or cohort details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Create Classroom
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-sm p-6 text-center space-y-4 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setQrModalClass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                Student Join QR
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{qrModalClass.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Class ID: {qrModalClass.code}</p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/student/join?class=${qrModalClass.code}`
                )}`}
                alt={`QR code for ${qrModalClass.code}`}
                className="w-48 h-48 rounded-xl shadow-xs"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Students can scan this QR code or navigate to{' '}
              <span className="font-semibold text-slate-800">/student/join</span> and enter code{' '}
              <span className="font-mono font-bold text-indigo-700">{qrModalClass.code}</span>
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={() => handleCopyJoinLink(qrModalClass.code)}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Copy Student Join Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CLASSROOM CONFIRMATION MODAL */}
      {classPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete this classroom?</h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone. Are you sure you want to permanently delete "{classPendingDelete.name}"?
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <span className="font-semibold">Deletion Failed:</span> {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setClassPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteClassroom}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Classroom
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
