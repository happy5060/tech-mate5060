import React, { useState } from 'react';
import {
  CreateLessonFormData,
  LessonDuration,
  TeachingStyle,
  DifficultyLevel,
  LessonLanguage
} from '../../types/lesson';
import {
  Sparkles,
  BookOpen,
  Layers,
  FileCheck2,
  CheckCircle2,
  Wand2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CreateLessonFormProps {
  onSubmit: (data: CreateLessonFormData) => void;
  isGenerating: boolean;
}

const COMMON_SUBJECTS = [
  'Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'English Literature',
  'History',
  'Geography',
  'Computer Science',
  'Economics'
];

const CLASS_LEVELS = [
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

const DURATIONS: LessonDuration[] = ['15 min', '30 min', '45 min', '60 min', '90 min'];

const TEACHING_STYLES: TeachingStyle[] = [
  'Interactive',
  'Lecture',
  'Discussion',
  'Activity-based',
  'Storytelling',
  'Mixed'
];

const DIFFICULTIES: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

const LANGUAGES: LessonLanguage[] = ['English', 'Hindi', 'Punjabi', 'Hinglish'];

export const CreateLessonForm: React.FC<CreateLessonFormProps> = ({
  onSubmit,
  isGenerating,
}) => {
  const [formData, setFormData] = useState<CreateLessonFormData>({
    subject: 'Biology',
    topic: '',
    classLevel: 'Grade 9',
    duration: '45 min',
    learningObjective: '',
    teachingStyle: 'Interactive',
    difficulty: 'Medium',
    language: 'English',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (data: CreateLessonFormData) => {
    const errs: { [key: string]: string } = {};

    if (!data.subject.trim()) {
      errs.subject = 'Please select or enter a subject.';
    }

    if (!data.topic.trim()) {
      errs.topic = 'Lesson topic is required (e.g., Photosynthesis & Light Reactions).';
    } else if (data.topic.trim().length < 3) {
      errs.topic = 'Topic must be at least 3 characters.';
    }

    if (!data.classLevel) {
      errs.classLevel = 'Please select a student / class level.';
    }

    if (!data.learningObjective.trim()) {
      errs.learningObjective =
        'Learning objective is required. What should students master by the end of the lesson?';
    } else if (data.learningObjective.trim().length < 15) {
      errs.learningObjective =
        'Please provide a slightly more descriptive objective (at least 15 characters).';
    }

    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(formData));
  };

  const handleChange = (field: keyof CreateLessonFormData, value: any) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      subject: true,
      topic: true,
      classLevel: true,
      learningObjective: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const fillSampleData = (scenario: 'science' | 'cs' | 'math') => {
    if (scenario === 'science') {
      setFormData({
        subject: 'Physics',
        topic: 'Electromagnetic Induction & Faraday’s Law',
        classLevel: 'Grade 10',
        duration: '45 min',
        learningObjective:
          'Students will explain how changing magnetic flux induces an electromotive force (EMF), state Faraday’s and Lenz’s laws, and demonstrate the principle using coil-and-magnet experiments.',
        teachingStyle: 'Interactive',
        difficulty: 'Medium',
        language: 'English',
      });
    } else if (scenario === 'cs') {
      setFormData({
        subject: 'Computer Science',
        topic: 'Binary Search Algorithm & Big-O Complexity',
        classLevel: 'Grade 11',
        duration: '60 min',
        learningObjective:
          'Students will trace the divide-and-conquer logic of binary search on sorted lists, compare its O(log n) efficiency against linear search O(n), and write clean pseudocode implementations.',
        teachingStyle: 'Activity-based',
        difficulty: 'Hard',
        language: 'English',
      });
    } else {
      setFormData({
        subject: 'Mathematics',
        topic: 'Pythagorean Theorem & Real-World Trigonometry',
        classLevel: 'Grade 8',
        duration: '45 min',
        learningObjective:
          'Students will geometrically prove a² + b² = c² for right-angled triangles and apply the relationship to solve real-world architectural and navigation distances.',
        teachingStyle: 'Discussion',
        difficulty: 'Medium',
        language: 'English',
      });
    }
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quick Sample Presets Bar with Translucent Surface */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
          <div className="p-1.5 bg-indigo-100/70 text-indigo-700 rounded-lg">
            <Wand2 className="w-4 h-4" />
          </div>
          <span>Curriculum Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fillSampleData('science')}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/90 border border-indigo-200/70 text-indigo-700 hover:bg-indigo-50 shadow-subtle hover:shadow-sm transition-all"
          >
            Faraday's Law (Physics)
          </button>
          <button
            type="button"
            onClick={() => fillSampleData('cs')}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/90 border border-indigo-200/70 text-indigo-700 hover:bg-indigo-50 shadow-subtle hover:shadow-sm transition-all"
          >
            Binary Search (CS)
          </button>
          <button
            type="button"
            onClick={() => fillSampleData('math')}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/90 border border-indigo-200/70 text-indigo-700 hover:bg-indigo-50 shadow-subtle hover:shadow-sm transition-all"
          >
            Pythagoras (Math)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Core Details */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700 shadow-subtle">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  1. Subject & Target Audience
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Establish domain, topic, and grade parameters
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="subject-suggestions"
                    placeholder="e.g. Science, Mathematics, History"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    className={`w-full text-xs sm:text-sm p-3 rounded-xl glass-input ${
                      errors.subject && touched.subject
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-400'
                        : ''
                    } focus:outline-none`}
                  />
                  <datalist id="subject-suggestions">
                    {COMMON_SUBJECTS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                {errors.subject && touched.subject && (
                  <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Class Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class / Student Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.classLevel}
                  onChange={(e) => handleChange('classLevel', e.target.value)}
                  onBlur={() => handleBlur('classLevel')}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl glass-input bg-white/80 focus:outline-none cursor-pointer"
                >
                  {CLASS_LEVELS.map((cl) => (
                    <option key={cl} value={cl}>
                      {cl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lesson Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Photosynthesis & Light Reactions, Newton's Laws, French Revolution"
                value={formData.topic}
                onChange={(e) => handleChange('topic', e.target.value)}
                onBlur={() => handleBlur('topic')}
                className={`w-full text-xs sm:text-sm p-3 rounded-xl glass-input ${
                  errors.topic && touched.topic
                    ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-400'
                    : ''
                } focus:outline-none`}
              />
              {errors.topic && touched.topic && (
                <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.topic}</span>
                </p>
              )}
            </div>

            {/* Learning Objective */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Learning Objective <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Specify measurable outcomes (Bloom's taxonomy)
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="By the end of this lesson, students will be able to identify, explain, calculate..."
                value={formData.learningObjective}
                onChange={(e) => handleChange('learningObjective', e.target.value)}
                onBlur={() => handleBlur('learningObjective')}
                className={`w-full text-xs sm:text-sm p-3.5 rounded-xl glass-input ${
                  errors.learningObjective && touched.learningObjective
                    ? 'border-rose-400 bg-rose-50/40 focus:ring-rose-400'
                    : ''
                } focus:outline-none leading-relaxed`}
              />
              {errors.learningObjective && touched.learningObjective && (
                <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.learningObjective}</span>
                </p>
              )}
            </div>
          </div>

          {/* Card: Pedagogical Parameters */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700 shadow-subtle">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  2. Pedagogical Style & Delivery
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Tune duration, instructional modality, and difficulty
                </p>
              </div>
            </div>

            {/* Duration Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Lesson Duration
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleChange('duration', dur)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all duration-150 ${
                      formData.duration === dur
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 border border-indigo-600'
                        : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Teaching Style & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teaching Style
                </label>
                <select
                  value={formData.teachingStyle}
                  onChange={(e) =>
                    handleChange('teachingStyle', e.target.value as TeachingStyle)
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl glass-input bg-white/80 focus:outline-none cursor-pointer"
                >
                  {TEACHING_STYLES.map((ts) => (
                    <option key={ts} value={ts}>
                      {ts}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => handleChange('difficulty', diff)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-medium transition-all duration-150 ${
                        formData.difficulty === diff
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 border border-indigo-600'
                          : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Instruction Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleChange('language', lang)}
                    className={`py-2 px-3 text-center rounded-xl text-xs font-medium transition-all duration-150 ${
                      formData.language === lang
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 border border-indigo-600'
                        : 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Preview / Generation Blueprint */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/70">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-700">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Package Blueprint Preview
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Your lesson package will be synthesized with these 8 complete, editable sections:
            </p>

            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              {[
                '1. Introduction with curiosity hook',
                '2. Measurable Learning Objectives',
                '3. Step-by-step Concept Explanation',
                '4. Real-world Case Examples',
                '5. Hands-on Classroom Activity',
                '6. Probing Discussion Prompts',
                '7. Multi-tier Assessment (MCQ & rubric)',
                '8. Synthesis & Transition Conclusion'
              ].map((sec, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sec}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-200/70 text-[11px] text-slate-500 space-y-1">
              <p>• Every section can be regenerated individually.</p>
              <p>• Printable teacher handout export ready.</p>
            </div>
          </div>

          {/* Primary CTA Box with Subtle Dark Gradient Glass */}
          <div className="rounded-3xl p-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white shadow-card space-y-3.5">
            <h4 className="text-sm font-bold tracking-tight">Ready to Generate?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generative AI will construct your tailored classroom package based on your configured parameters.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-glow"
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-4 h-4 text-white" />}
            >
              Generate Lesson
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
