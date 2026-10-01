import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreateLessonFormData, GenerationStage, GenerationStageId } from '../types/lesson';
import { lessonService, GENERATION_STAGES } from '../services/api/lessonService';
import { CreateLessonForm } from '../components/forms/CreateLessonForm';
import { GeneratingModal } from '../components/forms/GeneratingModal';
import { ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

interface CreateLessonProps {
  onLessonCreated?: () => void;
}

export const CreateLesson: React.FC<CreateLessonProps> = ({ onLessonCreated }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStageId, setCurrentStageId] = useState<GenerationStageId>('understanding');
  const [activeFormSnapshot, setActiveFormSnapshot] = useState<CreateLessonFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (formData: CreateLessonFormData) => {
    setIsGenerating(true);
    setActiveFormSnapshot(formData);
    setErrorMessage(null);
    setCurrentStageId('understanding');

    try {
      const createdLesson = await lessonService.generateLesson(
        formData,
        (stage: GenerationStage) => {
          setCurrentStageId(stage.id);
        }
      );

      if (onLessonCreated) onLessonCreated();

      // Navigate to the newly generated lesson's workspace/editor
      navigate(`/workspace/${createdLesson.id}`);
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(
        err.message || 'An error occurred during lesson generation. Please try again.'
      );
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="text-xs text-slate-400 font-medium">Step 1 of 2: Configure Parameters</span>
      </div>

      {/* Header Info */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 text-[11px] font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Generative Curriculum Architect</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Classroom Lesson
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
          Provide your pedagogical requirements below. Our model will synthesize an aligned 8-section classroom lesson package with exercises, activities, and rubrics.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Configuration Form */}
      <CreateLessonForm onSubmit={handleGenerate} isGenerating={isGenerating} />

      {/* Generating State Modal (Screen 3) */}
      {isGenerating && activeFormSnapshot && (
        <GeneratingModal
          currentStageId={currentStageId}
          subject={activeFormSnapshot.subject}
          topic={activeFormSnapshot.topic}
          classLevel={activeFormSnapshot.classLevel}
          duration={activeFormSnapshot.duration}
        />
      )}
    </div>
  );
};
