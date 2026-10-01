import React, { useState } from 'react';
import { AssessmentQuestion, QuestionType } from '../../types/lesson';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Send,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Award,
  KeyRound,
  FileCheck2,
  Check,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export type TestState = 'not_started' | 'in_progress' | 'submitted' | 'review';

interface StudentTestModeProps {
  questions: AssessmentQuestion[];
  instructions?: string;
  onExit?: () => void;
  onComplete?: (score: number, maxScore: number) => void;
  onActiveChange?: (active: boolean) => void;
}

export const StudentTestMode: React.FC<StudentTestModeProps> = ({
  questions,
  instructions,
  onExit,
  onComplete,
  onActiveChange
}) => {
  // Test State: 'in_progress' | 'submitted' | 'review'
  const [testState, setTestState] = useState<TestState>('in_progress');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const getQuestionKey = (q: AssessmentQuestion, index: number) => q.id || `q-${index}`;

  const handleSelectOption = (key: string, value: string) => {
    if (testState !== 'in_progress') return;
    setAnswers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTextChange = (key: string, value: string) => {
    if (testState !== 'in_progress') return;
    setAnswers((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Count answered questions
  const answeredIndices = questions
    .map((q, idx) => ((answers[getQuestionKey(q, idx)] || '').trim().length > 0 ? idx : -1))
    .filter((idx) => idx !== -1);
  const answeredCount = answeredIndices.length;
  const unansweredCount = totalQuestions - answeredCount;

  // Grade check
  const checkIsCorrect = (q: AssessmentQuestion, studentAnswer?: string) => {
    if (!studentAnswer) return false;
    const cleanStudent = studentAnswer.trim().toLowerCase();
    const cleanCorrect = q.correctAnswer.trim().toLowerCase();
    return cleanStudent === cleanCorrect;
  };

  const gradableQuestions = questions.filter(
    (q) => q.type === 'MCQ' || q.type === 'True / False'
  );

  const correctGradableCount = gradableQuestions.filter((q, idx) => {
    const originalIndex = questions.indexOf(q);
    const studentAnswer = answers[getQuestionKey(q, originalIndex)];
    return checkIsCorrect(q, studentAnswer);
  }).length;

  const scorePercentage =
    gradableQuestions.length > 0
      ? Math.round((correctGradableCount / gradableQuestions.length) * 100)
      : 100;

  // Submit test handler
  const handleAttemptSubmit = () => {
    if (unansweredCount > 0) {
      setShowUnansweredWarning(true);
    } else {
      finalizeSubmit();
    }
  };

  const finalizeSubmit = () => {
    setShowUnansweredWarning(false);
    setTestState('submitted');
    if (onComplete) {
      onComplete(correctGradableCount, gradableQuestions.length);
    }
  };

  React.useEffect(() => {
    if (onActiveChange) {
      onActiveChange(testState === 'in_progress');
    }
  }, [testState, onActiveChange]);

  // Retake test handler: resets answers, resets score, resets to question 1
  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setTestState('in_progress');
    setShowUnansweredWarning(false);
  };

  const getTypeBadgeVariant = (type: QuestionType) => {
    switch (type) {
      case 'MCQ':
        return 'brand';
      case 'Short Answer':
        return 'purple';
      case 'True / False':
        return 'neutral';
      case 'Application Based':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const isCurrentAnswered = currentQuestion
    ? (answers[getQuestionKey(currentQuestion, currentIndex)] || '').trim().length > 0
    : false;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 bg-white/80 backdrop-blur-xl shadow-glass transition-all duration-300">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 bg-gradient-to-r from-indigo-50/80 via-white/50 to-purple-50/50 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl text-white shadow-sm ring-2 ring-indigo-100 shrink-0">
            {testState === 'in_progress' ? (
              <GraduationCap className="w-5 h-5" />
            ) : (
              <Award className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {testState === 'in_progress' ? 'Assessment — Test Mode' : 'Assessment — Test Results & Review'}
              </h3>
              <Badge variant={testState === 'in_progress' ? 'brand' : 'success'} size="sm">
                {testState === 'in_progress' ? 'Active Test' : 'Test Complete'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {testState === 'in_progress'
                ? 'Correct answers and explanations are hidden during the test session.'
                : 'Review your submitted answers against benchmark solutions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {testState !== 'in_progress' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetake}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="bg-white/80 hover:bg-white rounded-xl shadow-xs"
            >
              Retake Test
            </Button>
          )}
          {onExit && (
            <Button
              variant="glass"
              size="sm"
              onClick={onExit}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="rounded-xl border-slate-200/70 text-slate-600 hover:text-slate-900"
            >
              Exit Test Mode
            </Button>
          )}
        </div>
      </div>

      {/* =========================================================================
          QUESTION / TEST MODE (testState === 'in_progress')
          Strictly NO correct answers or explanations rendered in the DOM!
      ========================================================================= */}
      {testState === 'in_progress' && currentQuestion && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Stepper Header & Progress Tracker */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-slate-500 font-medium">
                {answeredCount} of {totalQuestions} answered ({Math.round((answeredCount / totalQuestions) * 100)}%)
              </span>
            </div>

            {/* Quick Question Selector Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {questions.map((q, idx) => {
                const isAns = (answers[getQuestionKey(q, idx)] || '').trim().length > 0;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    title={`Jump to Question ${idx + 1} (${isAns ? 'Answered' : 'Unanswered'})`}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-sm scale-105'
                        : isAns
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                        : 'bg-white/70 text-slate-500 border border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {instructions && (
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-600 leading-relaxed font-medium">
                <span className="font-semibold text-slate-800">Instructions: </span>
                {instructions}
              </div>
            )}
          </div>

          {/* Single Question Presentation Card */}
          <div className="p-6 rounded-2xl glass-card border border-white/70 bg-white/75 shadow-glass space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {currentIndex + 1}
                </span>
                <Badge variant={getTypeBadgeVariant(currentQuestion.type)} size="sm">
                  {currentQuestion.type}
                </Badge>
              </div>

              {isCurrentAnswered ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Answer Recorded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Unanswered
                </span>
              )}
            </div>

            {/* Question Text */}
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* MCQ Options Rendering (NO CORRECT ANSWERS RENDERED) */}
            {currentQuestion.type === 'MCQ' && currentQuestion.options && (
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt, optIdx) => {
                  const qKey = getQuestionKey(currentQuestion, currentIndex);
                  const isSelected = answers[qKey] === opt;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(qKey, opt)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 font-semibold ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-indigo-50/30'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-500 border-slate-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : letter}
                      </div>
                      <span className="leading-snug flex-1">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* True / False Options (NO CORRECT ANSWERS RENDERED) */}
            {currentQuestion.type === 'True / False' && (
              <div className="flex items-center gap-3 pt-2">
                {['True', 'False'].map((tf) => {
                  const qKey = getQuestionKey(currentQuestion, currentIndex);
                  const isSelected = answers[qKey] === tf;

                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => handleSelectOption(qKey, tf)}
                      className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 shadow-xs'
                          : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-indigo-50/40'
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer / Application Based Input (NO BENCHMARK ANSWERS RENDERED) */}
            {(currentQuestion.type === 'Short Answer' || currentQuestion.type === 'Application Based') && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Write Your Response:
                </label>
                <textarea
                  rows={4}
                  value={answers[getQuestionKey(currentQuestion, currentIndex)] || ''}
                  onChange={(e) =>
                    handleTextChange(getQuestionKey(currentQuestion, currentIndex), e.target.value)
                  }
                  placeholder="Type your explanation or worked solution here..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-md focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            <Button
              variant="outline"
              size="md"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="bg-white/70 hover:bg-white"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAttemptSubmit}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="shadow-md shadow-indigo-500/20 active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                >
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RESULTS & REVIEW MODE (testState === 'submitted' || testState === 'review')
          Answers and explanations are calculated and revealed ONLY now!
      ========================================================================= */}
      {(testState === 'submitted' || testState === 'review') && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Summary Score Card */}
          <div className="p-6 rounded-2xl glass-card border border-white/80 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white/80 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Test Complete
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {scorePercentage}%
                </span>
                {gradableQuestions.length > 0 && (
                  <span className="text-sm font-semibold text-slate-600">
                    ({correctGradableCount} / {gradableQuestions.length} Objective Questions Correct)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {scorePercentage >= 80
                  ? 'Outstanding performance! You have demonstrated strong mastery of this lesson material.'
                  : scorePercentage >= 60
                  ? 'Good work! Review the explanations below to strengthen your understanding.'
                  : 'Keep practicing! Review the correct solutions and pedagogical explanations below.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={handleRetake}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="shadow-md shadow-indigo-500/20 active:scale-95"
              >
                Retake Test
              </Button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Detailed Question Analysis
            </h4>

            {questions.map((q, idx) => {
              const qKey = getQuestionKey(q, idx);
              const studentAnswer = answers[qKey] || '';
              const isGradable = q.type === 'MCQ' || q.type === 'True / False';
              const isCorrect = isGradable && checkIsCorrect(q, studentAnswer);

              return (
                <div
                  key={qKey}
                  className={`p-5 rounded-2xl glass-card border transition-all space-y-3.5 ${
                    isGradable
                      ? isCorrect
                        ? 'border-emerald-300/80 bg-emerald-50/20'
                        : 'border-rose-300/80 bg-rose-50/20'
                      : 'border-slate-200/80 bg-white/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <Badge variant={getTypeBadgeVariant(q.type)} size="sm">
                        {q.type}
                      </Badge>
                    </div>

                    {isGradable ? (
                      isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ✓ Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          ✗ Incorrect
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                        Written Response
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </p>

                  {/* Answers Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div
                      className={`p-3 rounded-xl border ${
                        isGradable
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <strong className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                        Your Answer:
                      </strong>
                      <span className="font-semibold">
                        {studentAnswer || <em className="text-slate-400 font-normal">No answer submitted</em>}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950">
                      <strong className="block text-[11px] uppercase tracking-wider text-emerald-700 mb-1">
                        Correct Answer:
                      </strong>
                      <span className="font-bold">{q.correctAnswer}</span>
                    </div>
                  </div>

                  {/* Explanation (Revealed ONLY after submission) */}
                  {q.explanation && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 font-medium">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-indigo-900 block font-bold mb-0.5">
                          Pedagogical Explanation:
                        </strong>
                        <span className="text-slate-700 leading-relaxed font-normal">{q.explanation}</span>
                      </div>
                    </div>
                  )}

                  {/* Rubric for Written Items */}
                  {q.rubric && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-medium">
                      <strong className="text-amber-900 block font-bold mb-0.5">
                        Grading Rubric / Criteria:
                      </strong>
                      <span className="text-slate-700 leading-relaxed font-normal">{q.rubric}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between">
            <Button
              variant="outline"
              size="md"
              onClick={onExit}
              className="bg-white/80 hover:bg-white"
            >
              Back to Lesson
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleRetake}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="shadow-md shadow-indigo-500/20 active:scale-95"
            >
              Retake Test
            </Button>
          </div>
        </div>
      )}

      {/* Unanswered Warning Modal */}
      {showUnansweredWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/80 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Unanswered Questions
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  You have <strong className="text-amber-700 font-semibold">{unansweredCount}</strong> unanswered question(s). Continue anyway?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUnansweredWarning(false);
                  // Jump to the first unanswered question
                  const firstUnanswered = questions.findIndex(
                    (q, idx) => !(answers[getQuestionKey(q, idx)] || '').trim()
                  );
                  if (firstUnanswered !== -1) {
                    setCurrentIndex(firstUnanswered);
                  }
                }}
                className="bg-white/80 hover:bg-white"
              >
                Go Back & Answer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={finalizeSubmit}
                className="bg-amber-600 hover:bg-amber-700 shadow-sm"
              >
                Submit Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
