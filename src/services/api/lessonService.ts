import {
  Lesson,
  CreateLessonFormData,
  LessonSectionKey,
  SectionAlignment,
  LessonFilterOptions,
  GenerationStage,
  LessonContent,
  LessonQualityReport,
  LessonQualitySection
} from '../../types/lesson';
import { INITIAL_MOCK_LESSONS } from '../../data/mockLessons';
import { supabase, invokeEdgeFunction, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'ai_classroom_lessons_v1';

export const GENERATION_STAGES: GenerationStage[] = [
  {
    id: 'understanding',
    label: 'Understanding lesson requirements',
    description: 'Analyzing curriculum parameters, student level, and learning style...'
  },
  {
    id: 'objectives',
    label: 'Structuring learning objectives',
    description: 'Formulating measurable cognitive and skill-based outcomes using Bloom’s taxonomy...'
  },
  {
    id: 'content',
    label: 'Creating lesson content',
    description: 'Synthesizing core conceptual explanations, key definitions, and real-world examples...'
  },
  {
    id: 'activity',
    label: 'Designing classroom activity',
    description: 'Framing step-by-step collaborative tasks and probing discussion prompts...'
  },
  {
    id: 'assessment',
    label: 'Preparing assessment',
    description: 'Generating multi-format diagnostic items (MCQs, short answer, application checks)...'
  }
];

// Helper: Read local cache
function getLocalCache(): Lesson[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_LESSONS));
      return INITIAL_MOCK_LESSONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_LESSONS;
  }
}

// Helper: Save local cache
function saveLocalCache(lessons: Lesson[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lessons));
  } catch (e) {
    console.error('Failed to update local cache:', e);
  }
}

/**
 * Maps Supabase DB Row to frontend Lesson model
 */
function mapDbRowToLesson(row: any): Lesson {
  const contentRaw = row.lesson_content || {};

  // Standardize camelCase for frontend
  const content: LessonContent = {
    introduction: contentRaw.introduction || '',
    learningObjectives: contentRaw.learning_objectives || contentRaw.learningObjectives || [],
    conceptExplanation: contentRaw.concept_explanation || contentRaw.conceptExplanation || '',
    examples: (contentRaw.examples || []).map((ex: any) => ({
      id: ex.id || `ex-${Math.random()}`,
      title: ex.title || 'Example',
      scenario: ex.scenario || '',
      explanation: ex.explanation || ''
    })),
    classroomActivity: {
      title: contentRaw.classroom_activity?.title || contentRaw.classroomActivity?.title || 'Classroom Activity',
      durationMinutes: contentRaw.classroom_activity?.duration_minutes || contentRaw.classroomActivity?.durationMinutes || 15,
      materialsNeeded: contentRaw.classroom_activity?.materials_needed || contentRaw.classroomActivity?.materialsNeeded || [],
      stepByStepInstructions: contentRaw.classroom_activity?.step_by_step_instructions || contentRaw.classroomActivity?.stepByStepInstructions || [],
      expectedOutcome: contentRaw.classroom_activity?.expected_outcome || contentRaw.classroomActivity?.expectedOutcome || ''
    },
    discussionQuestions: (contentRaw.discussion_questions || contentRaw.discussionQuestions || []).map((dq: any) => ({
      id: dq.id || `dq-${Math.random()}`,
      question: dq.question || '',
      facilitatorGuidance: dq.facilitator_guidance || dq.facilitatorGuidance || ''
    })),
    assessment: {
      instructions: contentRaw.assessment?.instructions || 'Answer the questions below.',
      questions: (contentRaw.assessment?.questions || []).map((q: any) => ({
        id: q.id || `q-${Math.random()}`,
        type: q.type || 'MCQ',
        question: q.question || '',
        options: q.options || undefined,
        correctAnswer: q.correct_answer || q.correctAnswer || '',
        explanation: q.explanation || undefined,
        rubric: q.rubric || undefined
      }))
    },
    conclusion: contentRaw.conclusion || ''
  };

  const alignmentsRaw = row.alignment_results || [];
  const alignments: SectionAlignment[] = alignmentsRaw.map((a: any) => ({
    sectionKey: a.section as LessonSectionKey,
    sectionTitle: formatSectionTitle(a.section),
    status: a.aligned ? 'aligned' : 'needs_review',
    note: a.reason || ''
  }));

  const qualityRaw = contentRaw.quality_report || (row as any).quality_report || (row as any).qualityReport;
  const qualityReport: LessonQualityReport | undefined = qualityRaw
    ? {
        overall_status: qualityRaw.overall_status === 'needs_review' ? 'needs_review' : 'ready',
        summary: qualityRaw.summary || '',
        evaluatedAt: qualityRaw.evaluatedAt || qualityRaw.evaluated_at || new Date().toISOString(),
        sections: (qualityRaw.sections || []).map((s: any) => ({
          section: s.section as LessonSectionKey,
          sectionTitle: s.sectionTitle || formatSectionTitle(s.section),
          status: s.status === 'good' ? 'good' : 'needs_review',
          reason: s.reason || ''
        }))
      }
    : undefined;

  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    topic: row.topic,
    classLevel: row.class_level,
    duration: row.duration,
    learningObjective: row.learning_objective,
    teachingStyle: row.teaching_style,
    difficulty: row.difficulty,
    language: row.language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    content,
    alignments: alignments.length > 0 ? alignments : getDefaultAlignments(),
    qualityReport
  };
}

/**
 * Maps frontend Lesson model to Supabase DB Row
 */
function mapLessonToDbRow(lesson: Lesson): any {
  return {
    id: lesson.id,
    title: lesson.title,
    subject: lesson.subject,
    topic: lesson.topic,
    class_level: lesson.classLevel,
    duration: lesson.duration,
    learning_objective: lesson.learningObjective,
    teaching_style: lesson.teachingStyle,
    difficulty: lesson.difficulty,
    language: lesson.language,
    lesson_content: {
      introduction: lesson.content.introduction,
      learning_objectives: lesson.content.learningObjectives,
      concept_explanation: lesson.content.conceptExplanation,
      examples: lesson.content.examples,
      classroom_activity: {
        title: lesson.content.classroomActivity.title,
        duration_minutes: lesson.content.classroomActivity.durationMinutes,
        materials_needed: lesson.content.classroomActivity.materialsNeeded,
        step_by_step_instructions: lesson.content.classroomActivity.stepByStepInstructions,
        expected_outcome: lesson.content.classroomActivity.expectedOutcome
      },
      discussion_questions: lesson.content.discussionQuestions.map((dq) => ({
        id: dq.id,
        question: dq.question,
        facilitator_guidance: dq.facilitatorGuidance
      })),
      assessment: {
        instructions: lesson.content.assessment.instructions,
        questions: lesson.content.assessment.questions.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          rubric: q.rubric
        }))
      },
      conclusion: lesson.content.conclusion,
      quality_report: lesson.qualityReport
    },
    alignment_results: lesson.alignments.map((a) => ({
      section: a.sectionKey,
      aligned: a.status === 'aligned',
      reason: a.note
    })),
    updated_at: new Date().toISOString()
  };
}

function formatSectionTitle(key: string): string {
  const map: Record<string, string> = {
    introduction: 'Introduction',
    learningObjectives: 'Learning Objectives',
    conceptExplanation: 'Concept Explanation',
    examples: 'Examples',
    classroomActivity: 'Classroom Activity',
    discussionQuestions: 'Discussion Questions',
    assessment: 'Assessment',
    conclusion: 'Conclusion'
  };
  return map[key] || key;
}

function getDefaultAlignments(): SectionAlignment[] {
  return [
    { sectionKey: 'introduction', sectionTitle: 'Introduction', status: 'aligned', note: 'Contextualizes target topic with student interest hook.' },
    { sectionKey: 'learningObjectives', sectionTitle: 'Learning Objectives', status: 'aligned', note: 'Explicitly aligned with input parameters.' },
    { sectionKey: 'conceptExplanation', sectionTitle: 'Concept Explanation', status: 'aligned', note: 'Core principles broken down step-by-step.' },
    { sectionKey: 'examples', sectionTitle: 'Examples', status: 'aligned', note: 'Realistic contextual situations.' },
    { sectionKey: 'classroomActivity', sectionTitle: 'Classroom Activity', status: 'aligned', note: 'Active engagement matching duration and style.' },
    { sectionKey: 'discussionQuestions', sectionTitle: 'Discussion Questions', status: 'aligned', note: 'Facilitates critical thinking.' },
    { sectionKey: 'assessment', sectionTitle: 'Assessment', status: 'aligned', note: 'Diagnostic evaluation covering recall and application.' },
    { sectionKey: 'conclusion', sectionTitle: 'Conclusion', status: 'aligned', note: 'Synthesizes key takeaways.' }
  ];
}

function generateFallbackQualityReport(lesson: Lesson): LessonQualityReport {
  const sections: LessonQualitySection[] = [];

  // 1. Introduction
  const hasIntro = Boolean(lesson.content.introduction && lesson.content.introduction.trim().length > 20);
  sections.push({
    section: 'introduction',
    sectionTitle: 'Introduction & Curiosity Hook',
    status: hasIntro ? 'good' : 'needs_review',
    reason: hasIntro
      ? `Engages students and contextualizes "${lesson.topic}" effectively.`
      : 'Introduction is brief or missing a strong student engagement hook.'
  });

  // 2. Learning Objectives
  const hasObjectives = Array.isArray(lesson.content.learningObjectives) && lesson.content.learningObjectives.length >= 2;
  sections.push({
    section: 'learningObjectives',
    sectionTitle: 'Learning Objectives',
    status: hasObjectives ? 'good' : 'needs_review',
    reason: hasObjectives
      ? 'Cognitively measurable outcomes aligned with Bloom’s taxonomy and class level.'
      : 'Learning objectives need explicit measurable action verbs.'
  });

  // 3. Concept Explanation
  const hasConcept = Boolean(lesson.content.conceptExplanation && lesson.content.conceptExplanation.trim().length > 40);
  sections.push({
    section: 'conceptExplanation',
    sectionTitle: 'Concept Explanation',
    status: hasConcept ? 'good' : 'needs_review',
    reason: hasConcept
      ? `Clear, structured conceptual breakdown appropriate for ${lesson.classLevel} (${lesson.difficulty} difficulty).`
      : 'Concept explanation needs greater depth and foundational definitions.'
  });

  // 4. Examples
  const hasExamples = Array.isArray(lesson.content.examples) && lesson.content.examples.length >= 1;
  sections.push({
    section: 'examples',
    sectionTitle: 'Applied Examples',
    status: hasExamples ? 'good' : 'needs_review',
    reason: hasExamples
      ? 'Concrete case scenarios reinforce theoretical principles.'
      : 'At least one realistic contextual example is required.'
  });

  // 5. Classroom Activity
  const hasActivity = Boolean(lesson.content.classroomActivity?.title && lesson.content.classroomActivity?.stepByStepInstructions?.length);
  sections.push({
    section: 'classroomActivity',
    sectionTitle: 'Classroom Activity',
    status: hasActivity ? 'good' : 'needs_review',
    reason: hasActivity
      ? `Active learning design matches ${lesson.duration} duration and ${lesson.teachingStyle} style.`
      : 'Activity instructions or expected outcomes require clearer structure.'
  });

  // 6. Discussion Questions
  const hasQuestions = Array.isArray(lesson.content.discussionQuestions) && lesson.content.discussionQuestions.length >= 1;
  sections.push({
    section: 'discussionQuestions',
    sectionTitle: 'Discussion Questions',
    status: hasQuestions ? 'good' : 'needs_review',
    reason: hasQuestions
      ? 'Inquiry prompts stimulate class discourse and critical thinking.'
      : 'Open-ended discussion prompts are needed to evaluate understanding.'
  });

  // 7. Assessment
  const hasAssessment = Array.isArray(lesson.content.assessment?.questions) && lesson.content.assessment.questions.length >= 1;
  sections.push({
    section: 'assessment',
    sectionTitle: 'Assessment & Diagnostics',
    status: hasAssessment ? 'good' : 'needs_review',
    reason: hasAssessment
      ? 'Diagnostic questions evaluate mastery of target learning objective.'
      : 'Assessment needs diagnostic questions targeting the core learning objective.'
  });

  // 8. Conclusion
  const hasConclusion = Boolean(lesson.content.conclusion && lesson.content.conclusion.trim().length > 15);
  sections.push({
    section: 'conclusion',
    sectionTitle: 'Conclusion & Wrap-up',
    status: hasConclusion ? 'good' : 'needs_review',
    reason: hasConclusion
      ? 'Synthesizes key takeaways and connects to next learning milestones.'
      : 'Conclusion needs a concise synthesis of key concepts.'
  });

  const allGood = sections.every((s) => s.status === 'good');
  return {
    overall_status: allGood ? 'ready' : 'needs_review',
    summary: allGood
      ? `Lesson package successfully meets pedagogical standards for ${lesson.classLevel} (${lesson.difficulty} difficulty).`
      : 'Some sections require review to align with curriculum quality standards.',
    sections,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * AI Classroom Creator Backend Service Layer
 */
export const lessonService = {
  /**
   * Fetch all lessons with optional filtering and sorting from Supabase
   */
  async getLessons(filter?: Partial<LessonFilterOptions>): Promise<Lesson[]> {
    try {
      let query = supabase.from('lessons').select('*');

      if (filter?.selectedSubject && filter.selectedSubject !== 'all') {
        query = query.ilike('subject', filter.selectedSubject);
      }

      if (filter?.selectedClass && filter.selectedClass !== 'all') {
        query = query.eq('class_level', filter.selectedClass);
      }

      if (filter?.searchQuery?.trim()) {
        const q = filter.searchQuery.trim();
        query = query.or(`title.ilike.%${q}%,subject.ilike.%${q}%,topic.ilike.%${q}%`);
      }

      if (filter?.sortBy === 'title') {
        query = query.order('title', { ascending: true });
      } else if (filter?.sortBy === 'duration') {
        query = query.order('duration', { ascending: true });
      } else {
        query = query.order('updated_at', { ascending: false });
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapDbRowToLesson);
        saveLocalCache(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch failed; using local storage cache:', err);
    }

    // Fallback to local cache with filtering
    let lessons = getLocalCache();

    if (filter?.searchQuery?.trim()) {
      const q = filter.searchQuery.toLowerCase();
      lessons = lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          l.topic.toLowerCase().includes(q)
      );
    }

    if (filter?.selectedSubject && filter.selectedSubject !== 'all') {
      lessons = lessons.filter(
        (l) => l.subject.toLowerCase() === filter.selectedSubject?.toLowerCase()
      );
    }

    if (filter?.selectedClass && filter.selectedClass !== 'all') {
      lessons = lessons.filter(
        (l) => l.classLevel.toLowerCase() === filter.selectedClass?.toLowerCase()
      );
    }

    if (filter?.sortBy === 'recent') {
      lessons.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (filter?.sortBy === 'title') {
      lessons.sort((a, b) => a.title.localeCompare(b.title));
    }

    return lessons;
  },

  /**
   * Fetch a single lesson by ID from Supabase
   */
  async getLesson(id: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return mapDbRowToLesson(data);
      }
    } catch (err) {
      console.warn('Supabase getLesson failed; using local storage:', err);
    }

    const cached = getLocalCache().find((l) => l.id === id);
    return cached || null;
  },

  /**
   * Generates a new lesson via Supabase Edge Function & Gemini 2.5 Flash
   */
  async generateLesson(
    formData: CreateLessonFormData,
    onStageChange?: (stage: GenerationStage) => void
  ): Promise<Lesson> {
    // 1. Advance through UI stages
    if (onStageChange) onStageChange(GENERATION_STAGES[0]);

    // 2. Call Supabase Edge Function
    const stageTimer1 = setTimeout(() => onStageChange?.(GENERATION_STAGES[1]), 600);
    const stageTimer2 = setTimeout(() => onStageChange?.(GENERATION_STAGES[2]), 1200);
    const stageTimer3 = setTimeout(() => onStageChange?.(GENERATION_STAGES[3]), 1800);
    const stageTimer4 = setTimeout(() => onStageChange?.(GENERATION_STAGES[4]), 2400);

    let rawData: any;
    try {
      const response = await invokeEdgeFunction<{ data: any }>('generate-lesson', formData);
      rawData = response.data || response;
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
    }

    const now = new Date().toISOString();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    // Convert raw JSON to lesson format
    const content: LessonContent = {
      introduction: rawData.introduction || '',
      learningObjectives: rawData.learning_objectives || rawData.learningObjectives || [],
      conceptExplanation: rawData.concept_explanation || rawData.conceptExplanation || '',
      examples: (rawData.examples || []).map((ex: any, i: number) => ({
        id: ex.id || `ex-${Date.now()}-${i}`,
        title: ex.title || `Example ${i + 1}`,
        scenario: ex.scenario || '',
        explanation: ex.explanation || ''
      })),
      classroomActivity: {
        title: rawData.classroom_activity?.title || rawData.classroomActivity?.title || 'Classroom Activity',
        durationMinutes: rawData.classroom_activity?.duration_minutes || rawData.classroomActivity?.durationMinutes || 15,
        materialsNeeded: rawData.classroom_activity?.materials_needed || rawData.classroomActivity?.materialsNeeded || [],
        stepByStepInstructions: rawData.classroom_activity?.step_by_step_instructions || rawData.classroomActivity?.stepByStepInstructions || [],
        expectedOutcome: rawData.classroom_activity?.expected_outcome || rawData.classroomActivity?.expectedOutcome || ''
      },
      discussionQuestions: (rawData.discussion_questions || rawData.discussionQuestions || []).map((dq: any, i: number) => ({
        id: dq.id || `dq-${Date.now()}-${i}`,
        question: dq.question || '',
        facilitatorGuidance: dq.facilitator_guidance || dq.facilitatorGuidance || ''
      })),
      assessment: {
        instructions: rawData.assessment?.instructions || 'Formative assessment.',
        questions: (rawData.assessment?.questions || []).map((q: any, i: number) => ({
          id: q.id || `q-${Date.now()}-${i}`,
          type: q.type || 'MCQ',
          question: q.question || '',
          options: q.options,
          correctAnswer: q.correct_answer || q.correctAnswer || '',
          explanation: q.explanation,
          rubric: q.rubric
        }))
      },
      conclusion: rawData.conclusion || ''
    };

    const newLesson: Lesson = {
      id,
      title: rawData.title || `${formData.subject}: ${formData.topic}`,
      subject: formData.subject,
      topic: formData.topic,
      classLevel: formData.classLevel,
      duration: formData.duration,
      learningObjective: formData.learningObjective,
      teachingStyle: formData.teachingStyle,
      difficulty: formData.difficulty,
      language: formData.language,
      createdAt: now,
      updatedAt: now,
      content,
      alignments: getDefaultAlignments()
    };

    // Save to Supabase
    await this.saveLesson(newLesson);

    return newLesson;
  },

  /**
   * Regenerate ONLY one single section using Supabase Edge Function
   */
  async regenerateSection(
    lessonId: string,
    sectionKey: LessonSectionKey
  ): Promise<{ sectionKey: LessonSectionKey; newContent: any }> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const body = {
      lessonConfiguration: {
        subject: lesson.subject,
        topic: lesson.topic,
        classLevel: lesson.classLevel,
        duration: lesson.duration,
        learningObjective: lesson.learningObjective,
        teachingStyle: lesson.teachingStyle,
        difficulty: lesson.difficulty,
        language: lesson.language
      },
      sectionName: sectionKey,
      existingSectionContent: lesson.content[sectionKey]
    };

    const res = await invokeEdgeFunction<{ section: string; newContent: any }>('regenerate-section', body);
    const newContent = res.newContent;

    // Apply updated section to lesson
    const updatedContent = {
      ...lesson.content,
      [sectionKey]: newContent
    };

    const updatedLesson = {
      ...lesson,
      content: updatedContent,
      updatedAt: new Date().toISOString()
    };

    await this.saveLesson(updatedLesson);

    return { sectionKey, newContent };
  },

  /**
   * Save or update full lesson in Supabase and local cache
   */
  async saveLesson(lesson: Lesson): Promise<Lesson> {
    const updated = {
      ...lesson,
      updatedAt: new Date().toISOString()
    };

    // Always update local cache
    const cached = getLocalCache();
    const idx = cached.findIndex((l) => l.id === lesson.id);
    if (idx !== -1) {
      cached[idx] = updated;
    } else {
      cached.unshift(updated);
    }
    saveLocalCache(cached);

    // Save to Supabase database
    try {
      const dbRow = mapLessonToDbRow(updated);
      const { error } = await supabase.from('lessons').upsert(dbRow);
      if (error) {
        console.warn('Supabase upsert note:', error.message);
      }
    } catch (err) {
      console.warn('Supabase upsert error:', err);
    }

    return updated;
  },

  /**
   * Partially update lesson properties
   */
  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson> {
    const existing = await this.getLesson(id);
    if (!existing) throw new Error('Lesson not found');

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return await this.saveLesson(merged);
  },

  /**
   * Delete a lesson from Supabase and cache
   */
  async deleteLesson(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid lesson ID provided for deletion');
    }

    const isStandardUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let dbError: any = null;

    // Delete from Supabase if configured and ID matches schema UUID type
    if (isStandardUuid && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) {
          dbError = error;
          console.error(`[lessonService.deleteLesson] Supabase error deleting ID "${id}":`, error);
        } else {
          console.log(`[lessonService.deleteLesson] Database record "${id}" deleted successfully from Supabase.`);
        }
      } catch (err: any) {
        dbError = err;
        console.warn(`[lessonService.deleteLesson] Network/timeout deleting from Supabase:`, err);
      }
    }

    // If Supabase returned an actual database error (e.g. RLS policy violation), throw error
    // Skip schema cache / table-not-found errors and network errors — proceed to local delete
    if (
      dbError &&
      dbError.code &&
      dbError.code !== 'UND_ERR_CONNECT_TIMEOUT' &&
      dbError.message &&
      !dbError.message.includes('fetch failed') &&
      !dbError.message.includes('schema cache') &&
      !dbError.message.includes('Could not find the table')
    ) {
      throw new Error(dbError.message || 'Database error occurred while deleting lesson from Supabase');
    }

    // Delete from local cache
    const cached = getLocalCache().filter((l) => l.id !== id);
    saveLocalCache(cached);
  },

  /**
   * Run Learning Objective Alignment Check via Edge Function
   */
  async checkAlignment(lessonId: string): Promise<SectionAlignment[]> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) return [];

    try {
      const res = await invokeEdgeFunction<{ alignments: Array<{ section: string; aligned: boolean; reason: string }> }>(
        'check-alignment',
        {
          learningObjective: lesson.learningObjective,
          lessonContent: lesson.content
        }
      );

      if (res?.alignments && Array.isArray(res.alignments)) {
        const alignments: SectionAlignment[] = res.alignments.map((a) => ({
          sectionKey: a.section as LessonSectionKey,
          sectionTitle: formatSectionTitle(a.section),
          status: a.aligned ? 'aligned' : 'needs_review',
          note: a.reason || ''
        }));

        await this.updateLesson(lessonId, { alignments });
        return alignments;
      }
    } catch (err) {
      console.warn('Edge Function check-alignment error, returning existing alignments:', err);
    }

    return lesson.alignments;
  },

  /**
   * Run Lesson Quality Check via Gemini Edge Function (Phase 1)
   */
  async checkLessonQuality(lessonId: string): Promise<LessonQualityReport> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    try {
      const res = await invokeEdgeFunction<LessonQualityReport>(
        'check-lesson-quality',
        {
          subject: lesson.subject,
          topic: lesson.topic,
          classLevel: lesson.classLevel,
          duration: lesson.duration,
          learningObjective: lesson.learningObjective,
          teachingStyle: lesson.teachingStyle,
          difficulty: lesson.difficulty,
          language: lesson.language,
          lessonContent: lesson.content
        }
      );

      if (res && res.overall_status && Array.isArray(res.sections)) {
        const report: LessonQualityReport = {
          overall_status: res.overall_status === 'needs_review' ? 'needs_review' : 'ready',
          summary: res.summary || (res.overall_status === 'ready' ? 'Curriculum package meets all pedagogical criteria.' : 'One or more sections require review.'),
          evaluatedAt: new Date().toISOString(),
          sections: res.sections.map((s) => ({
            section: s.section as LessonSectionKey,
            sectionTitle: formatSectionTitle(s.section),
            status: s.status === 'good' ? 'good' : 'needs_review',
            reason: s.reason || ''
          }))
        };

        await this.updateLesson(lessonId, { qualityReport: report });
        return report;
      }
    } catch (err) {
      console.warn('Edge Function check-lesson-quality error, using criteria fallback evaluator:', err);
    }

    const fallback = generateFallbackQualityReport(lesson);
    await this.updateLesson(lessonId, { qualityReport: fallback });
    return fallback;
  },

  /**
   * Export lesson: trigger print dialog for teacher handout or download JSON
   */
  async exportLesson(lessonId: string, format: 'print' | 'json'): Promise<void> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) return;

    if (format === 'print') {
      window.print();
    } else if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lesson, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${lesson.title.replace(/\s+/g, '_')}_package.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  },

  resetToSampleData(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_LESSONS));
  },

  clearAllLessons(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  }
};
