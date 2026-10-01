import {
  Classroom,
  PublishedLesson,
  StudentProgress,
  StudentClassroomMembership,
  AssessmentAttempt,
  LessonResource
} from '../../types/classroom';
import { Lesson } from '../../types/lesson';
import { lessonService } from './lessonService';
import { videoResourceService } from './videoResourceService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_CLASSROOMS = 'ai_classroom_classrooms_v1';
const STORAGE_KEY_PUBLISHED = 'ai_classroom_published_lessons_v1';
const STORAGE_KEY_PROGRESS = 'ai_classroom_student_progress_v1';
const STORAGE_KEY_MEMBERSHIPS = 'ai_classroom_memberships_v1';
const STORAGE_KEY_ATTEMPTS = 'ai_classroom_assessment_attempts_v1';

// Initial starter mock classrooms
const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-bio-801',
    name: 'Class 8 Biology A',
    subject: 'Biology',
    classLevel: 'Grade 8',
    code: 'BIO9A7K',
    teacherName: 'Ananya Sharma',
    description: 'Foundation course exploring cell structures, botany and living organisms.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    studentCount: 24,
    publishedCount: 3
  },
  {
    id: 'cls-sci-902',
    name: 'Class 9 Physics Lab',
    subject: 'Physics',
    classLevel: 'Grade 9',
    code: 'PHY91XZ',
    teacherName: 'Ananya Sharma',
    description: 'Mechanics, Newton laws of motion, force and energy transformations.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    studentCount: 28,
    publishedCount: 2
  },
  {
    id: 'cls-mat-803',
    name: 'Class 8 Mathematics',
    subject: 'Mathematics',
    classLevel: 'Grade 8',
    code: 'MATH82P',
    teacherName: 'Marcus Vance',
    description: 'Linear equations, polynomials, geometry proofs and algebra basics.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    studentCount: 22,
    publishedCount: 1
  }
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Failed to save to ${key}:`, e);
  }
}

export function generateClassCode(subject: string, level?: string): string {
  const cleanSub = subject.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'CLS';
  const levelNum = (level || '').match(/\d+/)?.[0] || '8';
  const randChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${cleanSub}${levelNum}${randChars}`.slice(0, 7); // e.g. BIO9A7K, MATH82P, PHY91XZ
}

export const classroomService = {
  // ==========================================
  // CLASSROOMS CRUD
  // ==========================================
  async getClassrooms(): Promise<Classroom[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('classrooms').select('*');
        if (!error && data && data.length > 0) {
          // Normalize db columns to camelCase Classroom interface
          const mapped: Classroom[] = data.map((d: any) => ({
            id: d.id,
            teacher_id: d.teacher_id,
            teacherName: d.teacher_name || 'Teacher',
            name: d.name,
            subject: d.subject,
            classLevel: d.class_level || d.classLevel || 'Grade 9',
            code: d.class_code || d.code,
            description: d.description || '',
            createdAt: d.created_at || d.createdAt || new Date().toISOString(),
            studentCount: d.student_count || 0
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getClassrooms warning:', err);
      }
    }

    return getStored<Classroom[]>(STORAGE_KEY_CLASSROOMS, INITIAL_CLASSROOMS);
  },

  async getClassroom(idOrCode: string): Promise<Classroom | null> {
    const all = await this.getClassrooms();
    const normalized = idOrCode.trim().toLowerCase();
    return (
      all.find(
        (c) => c.id.toLowerCase() === normalized || c.code.toLowerCase() === normalized
      ) || null
    );
  },

  async createClassroom(data: {
    name: string;
    subject: string;
    classLevel: string;
    description?: string;
    teacherName?: string;
    teacherId?: string;
  }): Promise<Classroom> {
    const code = generateClassCode(data.subject, data.classLevel);

    const newClassroom: Classroom = {
      id: `cls-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      subject: data.subject.trim(),
      classLevel: data.classLevel.trim(),
      code,
      teacher_id: data.teacherId,
      teacherName: data.teacherName || 'Ananya Sharma',
      description: data.description?.trim() || '',
      createdAt: new Date().toISOString(),
      studentCount: 0,
      publishedCount: 0
    };

    if (isSupabaseConfigured) {
      try {
        const dbPayload = {
          id: newClassroom.id,
          name: newClassroom.name,
          subject: newClassroom.subject,
          class_level: newClassroom.classLevel,
          class_code: newClassroom.code,
          description: newClassroom.description,
          teacher_name: newClassroom.teacherName
        };

        const { data: dbData, error } = await supabase
          .from('classrooms')
          .insert(dbPayload)
          .select()
          .single();

        if (!error && dbData) {
          const current = getStored<Classroom[]>(STORAGE_KEY_CLASSROOMS, INITIAL_CLASSROOMS);
          setStored(STORAGE_KEY_CLASSROOMS, [newClassroom, ...current]);
          return newClassroom;
        }
      } catch (err) {
        console.warn('Supabase createClassroom warning:', err);
      }
    }

    const current = getStored<Classroom[]>(STORAGE_KEY_CLASSROOMS, INITIAL_CLASSROOMS);
    const updated = [newClassroom, ...current];
    setStored(STORAGE_KEY_CLASSROOMS, updated);
    return newClassroom;
  },

  async deleteClassroom(id: string): Promise<void> {
    const current = getStored<Classroom[]>(STORAGE_KEY_CLASSROOMS, INITIAL_CLASSROOMS);
    setStored(STORAGE_KEY_CLASSROOMS, current.filter((c) => c.id !== id));

    // Also remove any published lessons linked to this classroom
    const currentPubs = getStored<PublishedLesson[]>(STORAGE_KEY_PUBLISHED, []);
    setStored(STORAGE_KEY_PUBLISHED, currentPubs.filter((p) => p.classroomId !== id));

    // Also remove memberships linked to this classroom
    const currentMembers = getStored<StudentClassroomMembership[]>(STORAGE_KEY_MEMBERSHIPS, []);
    setStored(STORAGE_KEY_MEMBERSHIPS, currentMembers.filter((m) => m.classroom_id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('classrooms').delete().eq('id', id);
        if (error) console.warn('Supabase deleteClassroom warning:', error);
      } catch (err) {
        console.warn('Supabase deleteClassroom warning:', err);
      }
    }
  },

  // ==========================================
  // PUBLISH / UNPUBLISH LESSONS
  // ==========================================
  async publishLesson(params: {
    lessonId: string;
    classroomId: string;
    allowChat?: boolean;
    allowTestMode?: boolean;
  }): Promise<PublishedLesson> {
    const lesson = await lessonService.getLesson(params.lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const classroom = await this.getClassroom(params.classroomId);
    const classroomName = classroom ? classroom.name : 'Classroom Cohort';
    const accessCode = classroom ? classroom.code : generateClassCode(lesson.subject, lesson.classLevel);

    const resources = await videoResourceService.getLessonResources(params.lessonId);

    const newPublish: PublishedLesson = {
      id: `pub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lessonId: lesson.id,
      classroomId: params.classroomId,
      classroomName,
      accessCode,
      title: lesson.title,
      subject: lesson.subject,
      classLevel: lesson.classLevel,
      publishedAt: new Date().toISOString(),
      is_active: true,
      lesson,
      resources,
      allowChat: params.allowChat ?? true,
      allowTestMode: params.allowTestMode ?? true
    };

    const published = getStored<PublishedLesson[]>(STORAGE_KEY_PUBLISHED, []);
    // Replace if already published to same classroom, or prepend
    const filtered = published.filter(
      (p) => !(p.lessonId === params.lessonId && p.classroomId === params.classroomId)
    );
    setStored(STORAGE_KEY_PUBLISHED, [newPublish, ...filtered]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('published_lessons').insert({
          id: newPublish.id,
          lesson_id: newPublish.lessonId,
          classroom_id: newPublish.classroomId,
          classroom_name: newPublish.classroomName,
          access_code: newPublish.accessCode,
          title: newPublish.title,
          subject: newPublish.subject,
          class_level: newPublish.classLevel,
          allow_chat: newPublish.allowChat,
          allow_test_mode: newPublish.allowTestMode,
          is_active: true
        });
      } catch (err) {
        console.warn('Supabase publishLesson warning:', err);
      }
    }

    return newPublish;
  },

  async unpublishLesson(publishedId: string): Promise<void> {
    const list = getStored<PublishedLesson[]>(STORAGE_KEY_PUBLISHED, []);
    setStored(STORAGE_KEY_PUBLISHED, list.filter((p) => p.id !== publishedId));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('published_lessons').delete().eq('id', publishedId);
      } catch (err) {
        console.warn('Supabase unpublishLesson warning:', err);
      }
    }
  },

  async getAllPublishedLessons(): Promise<PublishedLesson[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('published_lessons').select('*');
        if (!error && data && data.length > 0) {
          // If lessons are linked, resolve them
          const resolved = await Promise.all(
            data.map(async (d: any) => {
              const fullLesson = await lessonService.getLesson(d.lesson_id);
              const resources = await videoResourceService.getLessonResources(d.lesson_id);
              return {
                id: d.id,
                lessonId: d.lesson_id,
                classroomId: d.classroom_id,
                classroomName: d.classroom_name,
                accessCode: d.access_code,
                title: d.title,
                subject: d.subject,
                classLevel: d.class_level,
                publishedAt: d.published_at,
                is_active: d.is_active !== false,
                lesson: (fullLesson || {
                  id: d.lesson_id,
                  title: d.title,
                  subject: d.subject,
                  topic: d.title,
                  classLevel: d.class_level,
                  duration: '45 min',
                  learningObjective: 'Core curriculum mastery',
                  teachingStyle: 'Interactive',
                  difficulty: 'Medium',
                  language: 'English',
                  content: {
                    introduction: '',
                    learningObjectives: [],
                    conceptExplanation: '',
                    examples: [],
                    classroomActivity: {
                      title: '',
                      durationMinutes: 15,
                      materialsNeeded: [],
                      stepByStepInstructions: [],
                      expectedOutcome: ''
                    },
                    discussionQuestions: [],
                    assessment: { instructions: '', questions: [] },
                    conclusion: ''
                  },
                  alignments: [],
                  createdAt: d.published_at,
                  updatedAt: d.published_at
                }) as Lesson,
                resources,
                allowChat: d.allow_chat !== false,
                allowTestMode: d.allow_test_mode !== false
              };
            })
          );
          return resolved;
        }
      } catch (err) {
        console.warn('Supabase getAllPublishedLessons warning:', err);
      }
    }

    return getStored<PublishedLesson[]>(STORAGE_KEY_PUBLISHED, []);
  },

  async getPublishedLessonsByClassroom(classroomId: string): Promise<PublishedLesson[]> {
    const all = await this.getAllPublishedLessons();
    return all.filter((p) => p.classroomId === classroomId);
  },

  async getPublishedLessonByCode(accessCode: string): Promise<PublishedLesson | null> {
    const all = await this.getAllPublishedLessons();
    const normalized = accessCode.trim().toLowerCase();
    return (
      all.find(
        (p) =>
          p.accessCode.toLowerCase() === normalized ||
          p.id.toLowerCase() === normalized ||
          p.lessonId.toLowerCase() === normalized
      ) || null
    );
  },

  // ==========================================
  // STUDENT JOIN & CLASSROOM MEMBERSHIP
  // ==========================================
  async joinClassroom(data: {
    classCode: string;
    studentName: string;
    studentIdentifier: string;
  }): Promise<{ classroom: Classroom; membership: StudentClassroomMembership }> {
    const normalizedCode = data.classCode.trim().toUpperCase();
    const classrooms = await this.getClassrooms();
    const classroom = classrooms.find((c) => c.code.toUpperCase() === normalizedCode);

    if (!classroom) {
      throw new Error(`Classroom with ID '${normalizedCode}' not found. Please verify with your teacher.`);
    }

    const memberships = getStored<StudentClassroomMembership[]>(STORAGE_KEY_MEMBERSHIPS, []);
    const existing = memberships.find(
      (m) =>
        m.classroom_id === classroom.id &&
        (m.student_identifier.toLowerCase() === data.studentIdentifier.trim().toLowerCase() ||
          m.student_name.toLowerCase() === data.studentName.trim().toLowerCase())
    );

    let membership: StudentClassroomMembership;
    if (existing) {
      membership = existing;
    } else {
      membership = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classroom_id: classroom.id,
        student_name: data.studentName.trim(),
        student_identifier: data.studentIdentifier.trim(),
        joined_at: new Date().toISOString()
      };
      setStored(STORAGE_KEY_MEMBERSHIPS, [membership, ...memberships]);

      if (isSupabaseConfigured) {
        try {
          await supabase.from('student_classroom_memberships').insert(membership);
        } catch (err) {
          console.warn('Supabase joinClassroom membership warning:', err);
        }
      }
    }

    // Save session in local storage for student experience
    localStorage.setItem(
      'ai_classroom_student_session',
      JSON.stringify({
        studentName: membership.student_name,
        studentId: membership.student_identifier,
        classroomId: classroom.id,
        classCode: classroom.code
      })
    );
    localStorage.setItem('ai_classroom_student_name', membership.student_name);

    return { classroom, membership };
  },

  async getClassroomMembers(classroomId: string): Promise<StudentClassroomMembership[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_classroom_memberships')
          .select('*')
          .eq('classroom_id', classroomId);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getClassroomMembers warning:', err);
      }
    }

    const memberships = getStored<StudentClassroomMembership[]>(STORAGE_KEY_MEMBERSHIPS, []);
    return memberships.filter((m) => m.classroom_id === classroomId);
  },

  async getAllMemberships(): Promise<StudentClassroomMembership[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_classroom_memberships')
          .select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getAllMemberships warning:', err);
      }
    }
    return getStored<StudentClassroomMembership[]>(STORAGE_KEY_MEMBERSHIPS, []);
  },

  // ==========================================
  // STUDENT PROGRESS TRACKING
  // ==========================================
  async recordProgress(data: {
    studentName: string;
    studentId?: string;
    lessonId: string;
    publishedLessonId?: string;
    classroomId?: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progress_percentage?: number;
    assessmentAttempted?: boolean;
    assessmentScore?: number;
    assessmentMaxScore?: number;
  }): Promise<StudentProgress> {
    const progressList = getStored<StudentProgress[]>(STORAGE_KEY_PROGRESS, []);
    const studentId = data.studentId || `stu-${data.studentName.toLowerCase().replace(/\s+/g, '-')}`;

    const existingIndex = progressList.findIndex(
      (p) =>
        (p.studentId.toLowerCase() === studentId.toLowerCase() ||
          p.studentName.toLowerCase() === data.studentName.toLowerCase()) &&
        p.lessonId === data.lessonId
    );

    const now = new Date().toISOString();
    let record: StudentProgress;

    const calcPercentage =
      data.progress_percentage !== undefined
        ? data.progress_percentage
        : data.status === 'Completed'
        ? 100
        : data.status === 'In Progress'
        ? 60
        : 0;

    if (existingIndex >= 0) {
      record = {
        ...progressList[existingIndex],
        status: data.status,
        progress_percentage: calcPercentage,
        assessmentAttempted:
          data.assessmentAttempted ?? progressList[existingIndex].assessmentAttempted,
        assessmentScore: data.assessmentScore ?? progressList[existingIndex].assessmentScore,
        assessmentMaxScore:
          data.assessmentMaxScore ?? progressList[existingIndex].assessmentMaxScore,
        lastActiveAt: now,
        completedAt: data.status === 'Completed' ? now : progressList[existingIndex].completedAt
      };
      progressList[existingIndex] = record;
    } else {
      record = {
        id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentName: data.studentName,
        studentId,
        lessonId: data.lessonId,
        publishedLessonId: data.publishedLessonId || '',
        classroomId: data.classroomId || '',
        status: data.status,
        progress_percentage: calcPercentage,
        assessmentAttempted: data.assessmentAttempted ?? false,
        assessmentScore: data.assessmentScore,
        assessmentMaxScore: data.assessmentMaxScore,
        started_at: now,
        lastActiveAt: now,
        completedAt: data.status === 'Completed' ? now : undefined
      };
      progressList.push(record);
    }

    setStored(STORAGE_KEY_PROGRESS, progressList);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('student_progress').upsert({
          id: record.id,
          student_name: record.studentName,
          student_id: record.studentId,
          classroom_id: record.classroomId,
          lesson_id: record.lessonId,
          published_lesson_id: record.publishedLessonId,
          status: record.status,
          progress_percentage: record.progress_percentage,
          assessment_attempted: record.assessmentAttempted,
          assessment_score: record.assessmentScore,
          assessment_max_score: record.assessmentMaxScore,
          completed_at: record.completedAt,
          last_active_at: record.lastActiveAt
        });
      } catch (err) {
        console.warn('Supabase recordProgress warning:', err);
      }
    }

    return record;
  },

  async getAllStudentProgress(): Promise<StudentProgress[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('student_progress').select('*');
        if (!error && data && data.length > 0) {
          const mapped: StudentProgress[] = data.map((d: any) => ({
            id: d.id,
            studentName: d.student_name,
            studentId: d.student_id,
            classroomId: d.classroom_id,
            lessonId: d.lesson_id,
            publishedLessonId: d.published_lesson_id,
            status: d.status,
            progress_percentage: d.progress_percentage || (d.status === 'Completed' ? 100 : 50),
            assessmentAttempted: Boolean(d.assessment_attempted),
            assessmentScore: d.assessment_score,
            assessmentMaxScore: d.assessment_max_score,
            started_at: d.started_at,
            lastActiveAt: d.last_active_at || d.updated_at || new Date().toISOString(),
            completedAt: d.completed_at
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getAllStudentProgress warning:', err);
      }
    }

    return getStored<StudentProgress[]>(STORAGE_KEY_PROGRESS, [
      {
        id: 'prog-demo-1',
        studentName: 'Rahul Verma',
        studentId: '24BCA001',
        classroomId: 'cls-bio-801',
        lessonId: 'mock-1',
        publishedLessonId: 'pub-1',
        status: 'Completed',
        progress_percentage: 100,
        assessmentAttempted: true,
        assessmentScore: 8,
        assessmentMaxScore: 10,
        lastActiveAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'prog-demo-2',
        studentName: 'Simran Kaur',
        studentId: '24BCA002',
        classroomId: 'cls-bio-801',
        lessonId: 'mock-1',
        publishedLessonId: 'pub-1',
        status: 'In Progress',
        progress_percentage: 60,
        assessmentAttempted: false,
        lastActiveAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'prog-demo-3',
        studentName: 'Aman Patel',
        studentId: '24BCA003',
        classroomId: 'cls-bio-801',
        lessonId: 'mock-1',
        publishedLessonId: 'pub-1',
        status: 'Not Started',
        progress_percentage: 0,
        assessmentAttempted: false,
        lastActiveAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  },

  async getStudentProgressForClassroom(classroomId: string): Promise<StudentProgress[]> {
    const all = await this.getAllStudentProgress();
    return all.filter((p) => p.classroomId === classroomId);
  },

  async getStudentProgressForLesson(lessonId: string): Promise<StudentProgress[]> {
    const all = await this.getAllStudentProgress();
    return all.filter((p) => p.lessonId === lessonId);
  },

  // ==========================================
  // ASSESSMENT ATTEMPTS
  // ==========================================
  async recordAssessmentAttempt(data: {
    studentName: string;
    studentId: string;
    classroomId?: string;
    lessonId: string;
    publishedLessonId?: string;
    score: number;
    totalQuestions: number;
    answers?: Record<string, any>;
  }): Promise<AssessmentAttempt> {
    const newAttempt: AssessmentAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      student_name: data.studentName,
      student_id: data.studentId,
      classroom_id: data.classroomId,
      lesson_id: data.lessonId,
      published_lesson_id: data.publishedLessonId,
      score: data.score,
      total_questions: data.totalQuestions,
      answers: data.answers || {},
      submitted_at: new Date().toISOString()
    };

    const attempts = getStored<AssessmentAttempt[]>(STORAGE_KEY_ATTEMPTS, []);
    setStored(STORAGE_KEY_ATTEMPTS, [newAttempt, ...attempts]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('assessment_attempts').insert(newAttempt);
      } catch (err) {
        console.warn('Supabase recordAssessmentAttempt warning:', err);
      }
    }

    return newAttempt;
  },

  async getAssessmentAttempts(studentId?: string, lessonId?: string): Promise<AssessmentAttempt[]> {
    const list = getStored<AssessmentAttempt[]>(STORAGE_KEY_ATTEMPTS, []);
    return list.filter((a) => {
      if (studentId && a.student_id !== studentId) return false;
      if (lessonId && a.lesson_id !== lessonId) return false;
      return true;
    });
  }
};
