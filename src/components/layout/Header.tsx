import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  PlusCircle,
  History,
  Settings,
  X,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Users,
  GraduationCap,
  ShieldCheck,
  Layers,
  Activity,
  ArrowRightLeft,
  User,
  LogOut
} from 'lucide-react';
import { lessonService } from '../../services/api/lessonService';
import { authService } from '../../services/api/authService';

interface HeaderProps {
  onDataReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDataReset }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPortalMenuOpen, setIsPortalMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const path = location.pathname;
  const isAdmin = path.startsWith('/admin');
  const isTeacher = path.startsWith('/teacher') || path.startsWith('/create') || path.startsWith('/workspace') || path.startsWith('/history') || path.startsWith('/lesson');
  const isStudent = path.startsWith('/student') || path.startsWith('/join');

  const currentUser = authService.getCurrentUser();

  // Navigation Links based on active portal context
  let navLinks: Array<{ to: string; label: string; icon: React.ReactNode }> = [];
  let portalBadge = { label: 'Platform', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' };

  if (isAdmin) {
    portalBadge = { label: 'Master Admin', color: 'bg-slate-900 text-white border-slate-700' };
    navLinks = [
      { to: '/admin', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
      { to: '/admin/teachers', label: 'Teachers', icon: <Users className="w-4 h-4" /> },
      { to: '/admin/students', label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
      { to: '/admin/classrooms', label: 'Classrooms', icon: <Layers className="w-4 h-4" /> },
      { to: '/admin/lessons', label: 'Lessons', icon: <BookOpen className="w-4 h-4" /> },
      { to: '/admin/activity', label: 'Activity', icon: <Sparkles className="w-4 h-4" /> }
    ];
  } else if (isTeacher) {
    portalBadge = { label: 'Teacher Portal', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' };
    navLinks = [
      { to: '/teacher', label: 'Dashboard', icon: <BookOpen className="w-4 h-4" /> },
      { to: '/teacher/create', label: 'Create Lesson', icon: <PlusCircle className="w-4 h-4" /> },
      { to: '/teacher/lessons', label: 'My Lessons', icon: <History className="w-4 h-4" /> },
      { to: '/teacher/classrooms', label: 'Classrooms', icon: <Layers className="w-4 h-4" /> },
      { to: '/teacher/activity', label: 'Student Activity', icon: <Activity className="w-4 h-4" /> },
      { to: '/teacher/profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
    ];
  } else if (isStudent) {
    portalBadge = { label: 'Student Portal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' };
    navLinks = [
      { to: '/student/join', label: 'Join Class', icon: <GraduationCap className="w-4 h-4" /> }
    ];
  } else {
    // Portal selector landing
    portalBadge = { label: 'Portal Selector', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    navLinks = [
      { to: '/admin/login', label: 'Master Admin', icon: <ShieldCheck className="w-4 h-4" /> },
      { to: '/teacher/login', label: 'Teacher', icon: <GraduationCap className="w-4 h-4" /> },
      { to: '/student/join', label: 'Student', icon: <BookOpen className="w-4 h-4" /> }
    ];
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetData = () => {
    lessonService.resetToSampleData();
    showToast('Mock sample lessons restored');
    if (onDataReset) onDataReset();
    setIsSettingsOpen(false);
  };

  const handleClearData = () => {
    lessonService.clearAllLessons();
    showToast('All lessons cleared (Empty state active)');
    if (onDataReset) onDataReset();
    setIsSettingsOpen(false);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm no-print transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 text-slate-900 group">
                <img
                  src="/logo.png"
                  alt="TechMate Logo"
                  className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-indigo-200/60 group-hover:scale-105 transition-all duration-300 ring-2 ring-indigo-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                      TechMate
                    </span>
                    <span
                      className={`text-[10px] tracking-wide font-bold border px-2 py-0.5 rounded-full shadow-subtle ${portalBadge.color}`}
                    >
                      {portalBadge.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                    AI Classroom &amp; Learning Platform
                  </p>
                </div>
              </Link>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1 pl-5 border-l border-slate-200/80">
                {navLinks.map((link) => {
                  const isActive =
                    link.to === '/'
                      ? location.pathname === '/'
                      : location.pathname === link.to || (link.to !== '/admin' && link.to !== '/teacher' && location.pathname.startsWith(link.to));

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-50/90 text-indigo-700 shadow-subtle border border-indigo-100/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Profile & Settings */}
            <div className="flex items-center gap-2.5">
              {/* Teacher Create Quick Action */}
              {isTeacher && (
                <Link
                  to="/teacher/create"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-glow transition-all duration-200 border border-indigo-500/40 active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Lesson</span>
                </Link>
              )}

              {/* Switch Portal Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPortalMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  title="Switch between Master Admin, Teacher, and Student portals"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Portals</span>
                </button>

                {isPortalMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-modal border border-slate-200 py-2 z-50 text-xs animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Portal
                    </div>
                    <Link
                      to="/admin"
                      onClick={() => setIsPortalMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-900" />
                      <span>Master Admin</span>
                    </Link>
                    <Link
                      to="/teacher"
                      onClick={() => setIsPortalMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold"
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Teacher Portal</span>
                    </Link>
                    <Link
                      to="/student/join"
                      onClick={() => setIsPortalMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Student Portal</span>
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <Link
                        to="/"
                        onClick={() => setIsPortalMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:bg-slate-50"
                      >
                        <span>Portal Selector Screen</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Toggle */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Application Settings & Demo Data"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/50"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-xs ${
                    isAdmin
                      ? 'bg-slate-900'
                      : isStudent
                      ? 'bg-emerald-600'
                      : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                  }`}
                >
                  {isAdmin ? 'AD' : isStudent ? 'ST' : currentUser?.display_name ? currentUser.display_name.slice(0, 2).toUpperCase() : 'AS'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-bold text-slate-900 leading-tight">
                    {isAdmin
                      ? 'Master Admin'
                      : isStudent
                      ? localStorage.getItem('ai_classroom_student_name') || 'Student'
                      : currentUser?.display_name || 'Ananya Sharma'}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {isAdmin ? 'System Administrator' : isStudent ? 'Learner' : 'Lead Science Educator'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200/80 py-2 bg-white/95 backdrop-blur-md px-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname === link.to || (link.to !== '/admin' && link.to !== '/teacher' && location.pathname.startsWith(link.to));

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Settings / Development Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal border border-white/80 w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 shadow-subtle">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Platform Configuration & Data
                </h3>
                <p className="text-xs text-slate-500">
                  Supabase database and live Gemini integration active
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 text-sm">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-900 backdrop-blur-xs">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3-Portal Architecture Active:</span>
                </p>
                <p className="leading-relaxed">
                  Master Admin (/admin), Teacher Portal (/teacher), and Student Portal (/student/join) are fully separated and connected with real Supabase synchronization.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active User Session
                </label>
                <div className="p-3 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-xs flex items-center justify-between shadow-subtle text-xs">
                  <div>
                    <p className="font-medium text-slate-800">
                      {currentUser?.display_name || 'Ananya Sharma'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Role: <span className="font-semibold text-indigo-700 capitalize">{currentUser?.role || 'teacher'}</span> ({currentUser?.email || 'teacher@example.com'})
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-700">
                  Curriculum Sample Data:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleResetData}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl border border-indigo-200/80 shadow-subtle transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Samples</span>
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-xl border border-rose-200/80 shadow-subtle transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Test Empty State</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-modal text-xs font-medium animate-in slide-in-from-bottom-2 border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
