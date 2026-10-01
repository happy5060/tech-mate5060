import { Lesson, LessonSectionKey } from './lesson';

export type UserRole = 'admin' | 'teacher' | 'student';

// --- Profiles & Auth ---
export interface Profile {
  id: string;
  auth_user_id?: string;
  role: UserRole;
  display_name: string;
  email: string;
  teacher_code?: string; // e.g. TCH-001
  department?: string;
  status: 'active' | 'disabled' | 'pending';
  created_at: string;
  updated_at: string;
}

// --- Manual Lesson Resources (YouTube & Documents) ---
export interface LessonResource {
  id: string;
  lesson_id: string;
  type: 'youtube' | 'link' | 'document';
  video_id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  channel?: string;
  duration?: string;
  added_by: string; // teacher name or id
  is_approved?: boolean;
  created_at: string;
}

// Legacy / Optional AI Analysis support if present
export interface VideoTimestamp {
  timestamp: string; // e.g. "02:15"
  label: string;
}

export interface VideoAnalysis {
  summary: string;
  key_concepts: string[];
  lesson_relevance: string;
  class_level_suitability: string;
  timestamps: VideoTimestamp[];
  analyzed_at?: string;
}

// --- AI Chatbot Types ---
export type ChatActionType =
  | 'explain_simpler'
  | 'give_example'
  | 'explain_step_by_step'
  | 'give_analogy';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionType?: ChatActionType;
  isRestricted?: boolean;
}

// --- Classroom & Publishing Types ---
export interface Classroom {
  id: string;
  teacher_id?: string;
  teacherId?: string; // legacy support
  teacherName?: string;
  name: string;
  subject: string;
  class_level?: string;
  classLevel: string; // standard camelCase
  class_code?: string;
  code: string; // Unique join code, e.g. "BIO9A7K"
  description?: string;
  created_at?: string;
  createdAt: string;
  updated_at?: string;
  studentCount?: number;
  publishedCount?: number;
}

export interface PublishedLesson {
  id: string;
  lessonId: string;
  classroomId: string;
  classroomName?: string;
  accessCode: string; // Unique share code, e.g. "BIO9A7K"
  title: string;
  subject: string;
  classLevel: string;
  publishedAt: string;
  is_active?: boolean;
  lesson: Lesson;
  resources: LessonResource[];
  allowChat: boolean;
  allowTestMode: boolean;
}

// --- Student Membership in Classrooms ---
export interface StudentClassroomMembership {
  id: string;
  classroom_id: string;
  student_name: string;
  student_identifier: string; // Roll number or Student ID e.g. 24BCA001
  joined_at: string;
}

// --- Student Progress & Assessment Tracking ---
export type StudentLessonStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface StudentProgress {
  id: string;
  studentName: string;
  studentId: string;
  lessonId: string;
  publishedLessonId: string;
  classroomId: string;
  status: StudentLessonStatus;
  progress_percentage?: number;
  assessmentAttempted: boolean;
  assessmentScore?: number;
  assessmentMaxScore?: number;
  started_at?: string;
  lastActiveAt: string;
  completedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  student_name: string;
  student_id: string;
  classroom_id?: string;
  lesson_id: string;
  published_lesson_id?: string;
  score: number;
  total_questions: number;
  answers?: Record<string, any>;
  submitted_at: string;
}

// --- Admin & Teacher Management ---
export interface TeacherAccount {
  id: string;
  name: string;
  email: string;
  teacher_code?: string;
  role: 'teacher';
  department?: string;
  status: 'active' | 'pending' | 'disabled';
  invitedAt: string;
  classroomCount?: number;
  lessonCount?: number;
}
