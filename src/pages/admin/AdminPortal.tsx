import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserPlus,
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Calendar,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { adminService, AdminSystemOverview } from '../../services/api/adminService';
import { authService } from '../../services/api/authService';
import { classroomService } from '../../services/api/classroomService';
import { lessonService } from '../../services/api/lessonService';
import { TeacherAccount, Classroom, StudentProgress } from '../../types/classroom';
import { Lesson } from '../../types/lesson';

export const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active section determined by URL or internal tab
  // /admin, /admin/teachers, /admin/students, /admin/classrooms, /admin/lessons, /admin/activity
  const path = location.pathname;
  let activeTab: 'dashboard' | 'teachers' | 'students' | 'classrooms' | 'lessons' | 'activity' = 'dashboard';
  if (path.includes('/admin/teachers')) activeTab = 'teachers';
  else if (path.includes('/admin/students')) activeTab = 'students';
  else if (path.includes('/admin/classrooms')) activeTab = 'classrooms';
  else if (path.includes('/admin/lessons')) activeTab = 'lessons';
  else if (path.includes('/admin/activity')) activeTab = 'activity';

  const [overview, setOverview] = useState<AdminSystemOverview | null>(null);
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Teacher Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [teacherId, setTeacherId] = useState('TCH-001');
  const [department, setDepartment] = useState('Science & STEM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Teacher details modal
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherAccount | null>(null);

  // Deletion modals state
  const [teacherPendingDelete, setTeacherPendingDelete] = useState<TeacherAccount | null>(null);
  const [classroomPendingDelete, setClassroomPendingDelete] = useState<Classroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ov, tchList, clsList, lesList, stuList] = await Promise.all([
        adminService.getSystemOverview(),
        adminService.getTeachers(),
        classroomService.getClassrooms(),
        lessonService.getLessons(),
        classroomService.getAllStudentProgress()
      ]);
      setOverview(ov);
      setTeachers(tchList);
      setClassrooms(clsList);
      setLessons(lesList);
      setStudents(stuList);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherId.trim()) return;

    if (!teacherPassword || teacherPassword.length < 4) {
      setCreateError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const newTch = await adminService.createTeacher({
        name: teacherName.trim(),
        email: teacherEmail.trim(),
        teacherId: teacherId.trim(),
        department: department.trim(),
        password: teacherPassword
      });

      setTeachers((prev) => [newTch, ...prev]);
      setCreateFeedback(`Teacher account for ${newTch.name} (${newTch.teacher_code}) created successfully. Password has been set.`);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPassword('');
      setTeacherId(`TCH-${Math.floor(100 + Math.random() * 900)}`);
      setIsCreateOpen(false);
      // Reload overview stats
      loadAllData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create teacher account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await adminService.toggleTeacherStatus(id);
    if (updated) {
      setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherPendingDelete) return;
    setIsDeleting(true);
    setDeleteModalError(null);
    try {
      await adminService.deleteTeacher(teacherPendingDelete.id, teacherPendingDelete.email);
      setTeachers((prev) =>
        prev.filter(
          (t) =>
            t.id !== teacherPendingDelete.id &&
            t.email.toLowerCase() !== teacherPendingDelete.email.toLowerCase()
        )
      );
      if (selectedTeacher?.id === teacherPendingDelete.id) {
        setSelectedTeacher(null);
      }
      setCreateFeedback(`Teacher account for "${teacherPendingDelete.name}" (${teacherPendingDelete.email}) has been permanently deleted.`);
      setTeacherPendingDelete(null);
      loadAllData();
    } catch (err: any) {
      setDeleteModalError(err.message || 'Failed to delete teacher account');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteClassroom = async () => {
    if (!classroomPendingDelete) return;
    setIsDeleting(true);
    setDeleteModalError(null);
    try {
      await classroomService.deleteClassroom(classroomPendingDelete.id);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroomPendingDelete.id));
      setCreateFeedback(`Classroom "${classroomPendingDelete.name}" has been permanently deleted.`);
      setClassroomPendingDelete(null);
      loadAllData();
    } catch (err: any) {
      setDeleteModalError(err.message || 'Failed to delete classroom');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: <Activity className="w-4 h-4" /> },
    { id: 'teachers', label: 'Teachers', path: '/admin/teachers', icon: <Users className="w-4 h-4" /> },
    { id: 'students', label: 'Students', path: '/admin/students', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'classrooms', label: 'Classrooms', path: '/admin/classrooms', icon: <Layers className="w-4 h-4" /> },
    { id: 'lessons', label: 'Lessons', path: '/admin/lessons', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', path: '/admin/activity', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Navbar */}
      <div className="glass-card bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-glass border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-400 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Master Admin Portal
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                System Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional governance & live database administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs text-xs font-semibold"
          >
            Create Teacher
          </Button>

          <button
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Sign out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {createFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{createFeedback}</span>
          </div>
          <button onClick={() => setCreateFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Subnavigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-glass">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {createFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{createFeedback}</span>
          </div>
          <button onClick={() => setCreateFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Real Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Teachers</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {overview?.totalTeachers ?? teachers.length}
              </p>
              <p className="text-[11px] text-slate-400">Institutional accounts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {overview?.totalStudents ?? 0}
              </p>
              <p className="text-[11px] text-slate-400">Active learners</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Classrooms</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {overview?.totalClassrooms ?? classrooms.length}
              </p>
              <p className="text-[11px] text-slate-400">Active cohorts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Lessons</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {overview?.totalLessons ?? lessons.length}
              </p>
              <p className="text-[11px] text-slate-400">Curriculum packages</p>
            </div>
          </div>

          {/* Real Recent Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Teacher Accounts */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Recent Teacher Accounts</span>
                </h3>
                <Link to="/admin/teachers" className="text-xs font-semibold text-indigo-600 hover:underline">
                  View All ({teachers.length})
                </Link>
              </div>

              {teachers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No teachers registered yet. Click &quot;Create Teacher&quot; above.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {teachers.slice(0, 4).map((tch) => (
                    <div
                      key={tch.id}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{tch.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-semibold">
                            {tch.teacher_code || 'TCH'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{tch.email}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tch.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {tch.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Classrooms */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Recent Classrooms</span>
                </h3>
                <Link to="/admin/classrooms" className="text-xs font-semibold text-indigo-600 hover:underline">
                  View All ({classrooms.length})
                </Link>
              </div>

              {classrooms.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No classrooms active yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {classrooms.slice(0, 4).map((cls) => (
                    <div
                      key={cls.id}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{cls.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {cls.subject} • {cls.classLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
                          {cls.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {cls.studentCount || 0} students
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Recent System Activity</span>
            </h3>

            {(!overview?.recentActivity || overview.recentActivity.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {overview.recentActivity.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{act.title}</p>
                      <p className="text-[11px] text-slate-400">Actor: {act.actor}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TEACHERS */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Teacher Management</h2>
              <p className="text-xs text-slate-500">
                Oversee pedagogical staff, activate/deactivate accounts, and inspect classroom assignments
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create Teacher
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Teacher ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {teachers.map((tch) => (
                    <tr key={tch.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-700">
                        {tch.teacher_code || 'TCH-001'}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{tch.name}</td>
                      <td className="p-4 text-slate-600">{tch.email}</td>
                      <td className="p-4 text-slate-500">{tch.department || 'General'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tch.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tch.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTeacher(tch)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tch.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                        >
                          {tch.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModalError(null);
                            setTeacherPendingDelete(tch);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                          title="Delete teacher account permanently"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STUDENTS */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Directory & Records</h2>
            <p className="text-xs text-slate-500">
              Students joined across cohorts and their lesson engagement status
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Student ID / Roll No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Classroom</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Assessment Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/60">
                      <td className="p-4 font-mono font-bold text-slate-700">{stu.studentId}</td>
                      <td className="p-4 font-bold text-slate-900">{stu.studentName}</td>
                      <td className="p-4 text-slate-500">{stu.classroomId}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stu.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stu.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {stu.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${stu.progress_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono">{stu.progress_percentage || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {stu.assessmentScore !== undefined && stu.assessmentMaxScore !== undefined
                          ? `${stu.assessmentScore} / ${stu.assessmentMaxScore}`
                          : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CLASSROOMS */}
      {activeTab === 'classrooms' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Institutional Classrooms</h2>
            <p className="text-xs text-slate-500">
              Active classrooms and student cohorts across the school
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
                      {cls.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {cls.classLevel}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{cls.name}</h3>
                  <p className="text-xs text-slate-500">{cls.subject}</p>
                  {cls.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cls.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="font-medium text-slate-700">Teacher: {cls.teacherName || 'Faculty'}</span>
                    <span className="block text-[11px] text-slate-400">{cls.studentCount || 0} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/teacher/classrooms/${cls.id}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteModalError(null);
                        setClassroomPendingDelete(cls);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                      title="Delete classroom permanently"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: LESSONS */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Curriculum Lesson Packages</h2>
            <p className="text-xs text-slate-500">
              Generated structured lessons in the central institutional repository
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="divide-y divide-slate-100">
              {lessons.map((les) => (
                <div key={les.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{les.title}</h4>
                    <p className="text-xs text-slate-500">
                      {les.subject} • {les.classLevel} • {les.duration}
                    </p>
                  </div>
                  <Link
                    to={`/lesson/${les.id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    View Package
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">System Activity & Audit Log</h2>
            <p className="text-xs text-slate-500">
              Real-time audit log of curriculum generation, publishing, and accounts
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5">
            {overview?.recentActivity && overview.recentActivity.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {overview.recentActivity.map((act) => (
                  <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{act.title}</p>
                      <p className="text-[11px] text-slate-500">Action initiated by: {act.actor}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No audit records found.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE TEACHER */}
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
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Teacher Account</h3>
                <p className="text-xs text-slate-500">Provision verified institutional educator credentials</p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="TCH-001"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Unique institutional teacher code (e.g. TCH-001)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ananya Sharma"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="teacher@example.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Subject Focus
                </label>
                <input
                  type="text"
                  placeholder="Science & STEM"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    Login Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Set teacher login password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full pl-10 pr-10 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Teacher will use this password to log into the Teacher Portal. Min 4 characters.
                </p>
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
                  Create Teacher
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER DETAILS */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {selectedTeacher.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedTeacher.name}</h3>
                <p className="text-xs text-slate-500">{selectedTeacher.email}</p>
              </div>
            </div>

            <div className="space-y-3 py-3 border-y border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Teacher ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTeacher.teacher_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{selectedTeacher.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">{selectedTeacher.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Classrooms:</span>
                <span className="font-semibold text-slate-800">{selectedTeacher.classroomCount || 0}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteModalError(null);
                  setTeacherPendingDelete(selectedTeacher);
                }}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              >
                Delete Account
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTeacher(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: TEACHER DELETE CONFIRMATION */}
      {teacherPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Teacher Account</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800 font-semibold">{teacherPendingDelete.name}</strong> (
                {teacherPendingDelete.email})? This action removes all credentials and login access immediately.
              </p>
            </div>

            {deleteModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteModalError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setTeacherPendingDelete(null);
                  setDeleteModalError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                onClick={confirmDeleteTeacher}
                isLoading={isDeleting}
              >
                Delete Teacher
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLASSROOM DELETE CONFIRMATION */}
      {classroomPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-modal border border-slate-200/80 w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Classroom</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete classroom{' '}
                <strong className="text-slate-800 font-semibold">{classroomPendingDelete.name}</strong> (
                Code: {classroomPendingDelete.code})? All student enrollments and published lessons in this class will also be unlinked.
              </p>
            </div>

            {deleteModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteModalError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setClassroomPendingDelete(null);
                  setDeleteModalError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
                onClick={confirmDeleteClassroom}
                isLoading={isDeleting}
              >
                Delete Class
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
