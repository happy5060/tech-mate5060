import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { classroomService } from '../services/api/classroomService';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  QrCode,
  AlertCircle,
  ArrowLeft,
  User,
  Hash
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const StudentJoin: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Prefill Class ID from query parameter e.g. /student/join?class=BIO9A7K or route /join/:code
  const queryClass = searchParams.get('class') || searchParams.get('code') || urlCode || '';

  const [classCode, setClassCode] = useState(queryClass.toUpperCase());
  const [studentName, setStudentName] = useState(
    localStorage.getItem('ai_classroom_student_name') || ''
  );
  const [studentId, setStudentId] = useState(
    localStorage.getItem('ai_classroom_student_id') || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (queryClass) {
      setClassCode(queryClass.toUpperCase());
    }
  }, [queryClass]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim() || !studentName.trim()) {
      setErrorMsg('Please enter both the Class ID and your name.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const cleanIdentifier = studentId.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`;

      // Save credentials for browser persistence
      localStorage.setItem('ai_classroom_student_name', studentName.trim());
      localStorage.setItem('ai_classroom_student_id', cleanIdentifier);

      const { classroom } = await classroomService.joinClassroom({
        classCode: classCode.trim(),
        studentName: studentName.trim(),
        studentIdentifier: cleanIdentifier
      });

      // Navigate to dedicated Student Classroom Dashboard
      navigate(`/student/class/${classroom.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Class ID. Please ask your teacher for the code.');
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

        {/* Join Card */}
        <div className="glass-card bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/60 p-8 shadow-glass space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.png"
              alt="TechMate Logo"
              className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-md ring-4 ring-indigo-50"
            />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Join TechMate Classroom
            </h1>
            <p className="text-xs text-slate-500">
              Enter your Class ID to access published curriculum lessons and interactive assessments
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Class ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. BIO9A7K"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-mono font-bold uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white/90 outline-none transition-all tracking-wider"
                  autoFocus={!classCode}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the unique code provided by your teacher (e.g. BIO9A7K)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Happy Singh"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white/90 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student ID / Roll Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 24BCA001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white/90 outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md py-3 text-xs sm:text-sm font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              JOIN CLASS
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Are you a teacher?</span>
            <Link to="/teacher/login" className="font-semibold text-indigo-600 hover:underline">
              Teacher Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
