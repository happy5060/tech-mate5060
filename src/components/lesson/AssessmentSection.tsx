import React, { useState } from 'react';
import { AssessmentQuestion, QuestionType } from '../../types/lesson';
import {
  HelpCircle,
  Edit2,
  Sparkles,
  Plus,
  Trash2,
  Check,
  X,
  FileCheck2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StudentTestMode } from './StudentTestMode';

interface AssessmentSectionProps {
  instructions: string;
  questions: AssessmentQuestion[];
  isEditable?: boolean;
  onSave: (instructions: string, questions: AssessmentQuestion[]) => void;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
}

export const AssessmentSection: React.FC<AssessmentSectionProps> = ({
  instructions,
  questions,
  isEditable = true,
  onSave,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [isTestMode, setIsTestMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftInstructions, setDraftInstructions] = useState(instructions);
  const [draftQuestions, setDraftQuestions] = useState<AssessmentQuestion[]>(questions);

  const startEdit = () => {
    setDraftInstructions(instructions);
    setDraftQuestions(JSON.parse(JSON.stringify(questions)));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftInstructions(instructions);
    setDraftQuestions(questions);
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave(draftInstructions, draftQuestions);
    setIsEditing(false);
  };

  const updateQuestion = (index: number, updates: Partial<AssessmentQuestion>) => {
    const next = [...draftQuestions];
    next[index] = { ...next[index], ...updates };
    setDraftQuestions(next);
  };

  const updateMcqOption = (qIndex: number, optIndex: number, value: string) => {
    const next = [...draftQuestions];
    const opts = [...(next[qIndex].options || [])];
    opts[optIndex] = value;
    next[qIndex].options = opts;
    setDraftQuestions(next);
  };

  const addMcqOption = (qIndex: number) => {
    const next = [...draftQuestions];
    const opts = [...(next[qIndex].options || []), `Option ${(next[qIndex].options?.length || 0) + 1}`];
    next[qIndex].options = opts;
    setDraftQuestions(next);
  };

  const removeMcqOption = (qIndex: number, optIndex: number) => {
    const next = [...draftQuestions];
    const opts = (next[qIndex].options || []).filter((_, i) => i !== optIndex);
    next[qIndex].options = opts;
    setDraftQuestions(next);
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: AssessmentQuestion = {
      id: `q-custom-${Date.now()}`,
      type,
      question: 'New diagnostic question prompt...',
      options: type === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : type === 'True / False' ? ['True', 'False'] : undefined,
      correctAnswer: type === 'True / False' ? 'True' : 'Model answer benchmark',
      explanation: 'Explanation for reference and feedback',
      rubric: type === 'Application Based' || type === 'Short Answer' ? 'Grading rubric criteria...' : undefined
    };
    setDraftQuestions([...draftQuestions, newQ]);
  };

  const removeQuestion = (index: number) => {
    setDraftQuestions(draftQuestions.filter((_, i) => i !== index));
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

  if (isTestMode) {
    return (
      <div id="section-assessment" className="print-card">
        <StudentTestMode
          questions={questions}
          instructions={instructions}
          onExit={() => setIsTestMode(false)}
        />
      </div>
    );
  }

  return (
    <div id="section-assessment" className="glass-panel rounded-2xl overflow-hidden print-card">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 shadow-subtle shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                7. Assessment Questions
              </h3>
              <Badge variant="brand" size="sm">
                {questions.length} Items
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Formative evaluation with diagnostic rubrics and answer keys
            </p>
          </div>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2 no-print">
            {!isEditing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsTestMode(true)}
                  leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                  className="rounded-xl shadow-xs active:scale-95"
                >
                  Take Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEdit}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Edit Questions
                </Button>
                <div className="relative group">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={onRegenerate}
                    isLoading={isRegenerating}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    className="rounded-xl border border-indigo-200/60 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50/80"
                  >
                    Regenerate
                  </Button>
                  <span className="pointer-events-none absolute -top-8 right-0 z-20 hidden group-hover:block whitespace-nowrap bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg shadow-md border border-white/10">
                    Regenerates ONLY Assessment questions
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  className="rounded-xl"
                >
                  Save Section
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Instructions */}
        {!isEditing ? (
          <div className="glass-card rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed border border-slate-200/80">
            <span className="font-semibold text-slate-800">Teacher Guidance: </span>
            {instructions}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assessment Instructions / Guidance
            </label>
            <input
              type="text"
              value={draftInstructions}
              onChange={(e) => setDraftInstructions(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl glass-input focus:outline-none"
            />
          </div>
        )}

        {/* Question Cards List */}
        <div className="space-y-4">
          {(isEditing ? draftQuestions : questions).map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-5 rounded-2xl glass-card space-y-3.5 border border-slate-200/80 hover:shadow-glass transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <Badge variant={getTypeBadgeVariant(q.type)} size="sm">
                    {q.type}
                  </Badge>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(idx, { type: e.target.value as QuestionType })
                      }
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-white/90 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="Short Answer">Short Answer</option>
                      <option value="True / False">True / False</option>
                      <option value="Application Based">Application Based</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Question Text */}
              {!isEditing ? (
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                  {q.question}
                </p>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl glass-input focus:outline-none"
                  />
                </div>
              )}

              {/* Options for MCQ */}
              {q.type === 'MCQ' && (
                <div className="pl-1 space-y-2 pt-1">
                  {!isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options?.map((opt, optIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs border transition-all ${
                              isCorrect
                                ? 'bg-emerald-50/90 border-emerald-300/80 text-emerald-900 font-semibold shadow-subtle'
                                : 'bg-white/60 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-300 bg-white/80 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Options & Correct Answer
                      </label>
                      {q.options?.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="w-4 text-xs font-bold text-slate-500">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateMcqOption(idx, optIdx, e.target.value)}
                            className="flex-1 text-xs p-2 border border-slate-300 rounded-lg bg-white/90"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(idx, { correctAnswer: opt })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                              q.correctAnswer === opt
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {q.correctAnswer === opt ? 'Correct' : 'Mark Correct'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMcqOption(idx, optIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addMcqOption(idx)}
                        leftIcon={<Plus className="w-3 h-3" />}
                        className="text-xs text-indigo-600 mt-1"
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* True / False details */}
              {q.type === 'True / False' && (
                <div className="pl-1 pt-1">
                  {!isEditing ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">
                        Answer Key:
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold border ${
                          q.correctAnswer === 'True'
                            ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100/80 text-rose-800 border-rose-200'
                        }`}
                      >
                        {q.correctAnswer}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-600">
                        Correct Answer:
                      </span>
                      {['True', 'False'].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => updateQuestion(idx, { correctAnswer: tf })}
                          className={`px-3.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                            q.correctAnswer === tf
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white/80 text-slate-700 border-slate-300'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Short Answer / Application Based Details */}
              {(q.type === 'Short Answer' || q.type === 'Application Based') && (
                <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                  {!isEditing ? (
                    <>
                      <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100/80 text-indigo-950">
                        <span className="font-bold text-indigo-900 block mb-0.5">
                          Model Answer / Benchmark:
                        </span>
                        {q.correctAnswer}
                      </div>
                      {q.rubric && (
                        <div className="text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-200/80">
                          <span className="font-bold text-slate-700 block mb-0.5">
                            Grading Rubric / Criteria:
                          </span>
                          {q.rubric}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Model Answer
                        </label>
                        <textarea
                          rows={2}
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(idx, { correctAnswer: e.target.value })
                          }
                          className="w-full text-xs p-2.5 rounded-xl glass-input focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Grading Rubric
                        </label>
                        <textarea
                          rows={2}
                          value={q.rubric || ''}
                          onChange={(e) =>
                            updateQuestion(idx, { rubric: e.target.value })
                          }
                          className="w-full text-xs p-2.5 rounded-xl glass-input focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation note */}
              {q.explanation && !isEditing && (
                <div className="text-[11px] text-slate-500 pt-1 flex items-start gap-1.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-700">Explanation:</strong> {q.explanation}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Question Controls while editing */}
        {isEditing && (
          <div className="p-4 glass-card border border-dashed border-indigo-200 rounded-2xl space-y-2.5 text-center">
            <p className="text-xs font-semibold text-slate-700">Add New Diagnostic Item</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('MCQ')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + MCQ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('Short Answer')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Short Answer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('True / False')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + True / False
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('Application Based')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                + Application Based
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
