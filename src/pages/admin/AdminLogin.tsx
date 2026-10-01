import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/api/authService';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await authService.signIn(email, password, 'admin');
      if (user.role !== 'admin') {
        throw new Error('Access denied. This account does not possess administrator privileges.');
      }
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal Selector</span>
        </Link>

        {/* Card */}
        <div className="glass-card bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/60 p-8 shadow-glass space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.png"
              alt="TechMate Logo"
              className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-md ring-4 ring-indigo-50"
            />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              TechMate Admin Portal
            </h1>
            <p className="text-xs text-slate-500">
              Institutional governance, teacher oversight, and curriculum administration
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white/90 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white/90 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Protected via Supabase Role-Based Authorization
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md py-3 text-xs sm:text-sm font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In as Administrator
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Are you an educator?</span>
            <Link to="/teacher/login" className="font-semibold text-indigo-600 hover:underline">
              Teacher Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
