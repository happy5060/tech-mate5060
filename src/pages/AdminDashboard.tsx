import React, { useState, useEffect } from 'react';
import { TeacherAccount } from '../types/classroom';
import { adminService } from '../services/api/adminService';
import {
  ShieldCheck,
  UserPlus,
  Users,
  GraduationCap,
  BookOpen,
  Send,
  Activity,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invite teacher modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [inviteDepartment, setInviteDepartment] = useState('Science & STEM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tchList, stats] = await Promise.all([
        adminService.getTeachers(),
        adminService.getSystemOverview()
      ]);
      setTeachers(tchList);
      setSystemOverview(stats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    if (!invitePassword || invitePassword.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTch = await adminService.inviteTeacher({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        department: inviteDepartment,
        password: invitePassword
      });

      setTeachers((prev) => [newTch, ...prev]);
      setFeedbackMsg(`Teacher account created for ${newTch.email}. Password has been set.`);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      setIsInviteOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to invite teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (teacherId: string) => {
    const updated = await adminService.toggleTeacherStatus(teacherId);
    if (updated) {
      setTeachers((prev) => prev.map((t) => (t.id === teacherId ? updated : t)));
    }
  };

  const handleDeleteTeacher = async (teacherId: string, name: string, email?: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete teacher "${name}"? This will remove their credentials and account.`)) {
      return;
    }
    try {
      await adminService.deleteTeacher(teacherId, email);
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId && (!email || t.email.toLowerCase() !== email.toLowerCase())));
      setFeedbackMsg(`Teacher "${name}" has been permanently deleted.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-indigo-900/20 ring-4 ring-indigo-50">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                School Administrator Console
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage teacher accounts, audit system curriculum activity, and oversee classrooms.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="shadow-xs shadow-indigo-500/20 self-start sm:self-center"
        >
          Create / Invite Teacher
        </Button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* System Metrics Overview */}
      {systemOverview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Teachers</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{systemOverview.teacherCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Classrooms</span>
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{systemOverview.classroomCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Curriculum Packages</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{systemOverview.lessonCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Published Lessons</span>
              <Send className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{systemOverview.publishedCount}</p>
          </div>
        </div>
      )}

      {/* Teachers Management Table */}
      <div className="glass-card bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Teacher Faculty Directory ({teachers.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Secure invitation flow. Zero plaintext passwords stored.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Teacher</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((tch) => (
                <tr key={tch.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{tch.name}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{tch.email}</td>
                  <td className="py-3 px-3 text-slate-600">{tch.department}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        tch.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tch.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tch.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(tch.id)}
                        className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                          tch.status === 'disabled' ? 'text-emerald-600' : 'text-slate-500 hover:text-amber-600'
                        }`}
                      >
                        {tch.status === 'disabled' ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(tch.id, tch.name, tch.email)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                        title="Delete teacher account permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Teacher Modal (Phase 14) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-glass z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Invite New Teacher</h3>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Set the teacher's login password below. The teacher will use this email and password to sign in to the Teacher Portal.
            </p>

            <form onSubmit={handleInviteTeacher} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  School Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. elena.rostova@oakridge.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject / Department
                </label>
                <input
                  type="text"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  Login Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showInvitePassword ? 'text' : 'password'}
                    required
                    placeholder="Set teacher login password"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full text-xs p-2.5 pl-8 pr-9 rounded-xl border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInvitePassword(!showInvitePassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showInvitePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Min 4 characters. Teacher uses this to log in.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Create Teacher Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
