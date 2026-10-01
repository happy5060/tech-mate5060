export type LessonDuration = '15 min' | '30 min' | '45 min' | '60 min' | '90 min';

export type TeachingStyle =
  | 'Interactive'
  | 'Lecture'
  | 'Discussion'
  | 'Activity-based'
  | 'Storytelling'
  | 'Mixed';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type LessonLanguage = 'English' | 'Hindi' | 'Punjabi' | 'Hinglish';

export type AlignmentStatus = 'aligned' | 'needs_review';

export interface SectionAlignment {
  sectionKey: LessonSectionKey;
  sectionTitle: string;
  status: AlignmentStatus;
  note: string;
}

export type QuestionType = 'MCQ' | 'Short Answer' | 'True / False' | 'Application Based';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation?: string;
  rubric?: string; // for Application or Short Answer
}

export interface ExampleItem {
  id: string;
  title: string;
  scenario: string;
  explanation: string;
}

export interface ClassroomActivity {
  title: string;
  durationMinutes: number;
  materialsNeeded: string[];
  stepByStepInstructions: string[];
  expectedOutcome: string;
}

export interface DiscussionQuestion {
  id: string;
  question: string;
  facilitatorGuidance: string;
}

export type LessonSectionKey =
  | 'introduction'
  | 'learningObjectives'
  | 'conceptExplanation'
  | 'examples'
  | 'classroomActivity'
  | 'discussionQuestions'
  | 'assessment'
  | 'conclusion';

export interface LessonContent {
  introduction: string;
  learningObjectives: string[];
  conceptExplanation: string;
  examples: ExampleItem[];
  classroomActivity: ClassroomActivity;
  discussionQuestions: DiscussionQuestion[];
  assessment: {
    instructions: string;
    questions: AssessmentQuestion[];
  };
  conclusion: string;
}

export type QualityStatus = 'good' | 'needs_review';

export interface LessonQualitySection {
  section: LessonSectionKey;
  sectionTitle?: string;
  status: QualityStatus;
  reason: string;
}

export interface LessonQualityReport {
  overall_status: 'ready' | 'needs_review';
  summary?: string;
  sections: LessonQualitySection[];
  evaluatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  topic: string;
  classLevel: string;
  duration: LessonDuration;
  learningObjective: string;
  teachingStyle: TeachingStyle;
  difficulty: DifficultyLevel;
  language: LessonLanguage;
  createdAt: string;
  updatedAt: string;
  content: LessonContent;
  alignments: SectionAlignment[];
  qualityReport?: LessonQualityReport;
}

export interface CreateLessonFormData {
  subject: string;
  topic: string;
  classLevel: string;
  duration: LessonDuration;
  learningObjective: string;
  teachingStyle: TeachingStyle;
  difficulty: DifficultyLevel;
  language: LessonLanguage;
}

export interface LessonFilterOptions {
  searchQuery: string;
  selectedSubject: string;
  selectedClass: string;
  sortBy: 'recent' | 'title' | 'duration';
}

export type GenerationStageId =
  | 'understanding'
  | 'objectives'
  | 'content'
  | 'activity'
  | 'assessment';

export interface GenerationStage {
  id: GenerationStageId;
  label: string;
  description: string;
}
