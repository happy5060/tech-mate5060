import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Shield, BookOpen, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/api/authService';

export const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/teacher/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="glass-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 p-6 sm:p-8 shadow-glass space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md ring-4 ring-indigo-50">
              {user?.display_name ? user.display_name.slice(0, 2).toUpperCase() : 'AS'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {user?.display_name || 'Ananya Sharma'}
              </h1>
              <p className="text-xs text-slate-500">{user?.email || 'teacher@example.com'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {user?.teacher_code || 'TCH-001'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Educator
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 self-start sm:self-center text-xs"
          >
            Sign Out
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Educator Credentials & Access
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Department</span>
              <p className="font-bold text-slate-800">{user?.department || 'Science & STEM'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Authentication Authority</span>
              <p className="font-bold text-slate-800">Supabase Auth (Role: Teacher)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Curriculum Model Access</span>
              <p className="font-bold text-slate-800">Gemini 2.5 Flash Connected</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">System Role Security</span>
              <p className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Teacher Account</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
