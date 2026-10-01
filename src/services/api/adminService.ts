import { TeacherAccount, Profile, Classroom } from '../../types/classroom';
import { classroomService } from './classroomService';
import { lessonService } from './lessonService';
import { authService } from './authService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AdminSystemOverview {
  totalTeachers: number;
  totalStudents: number;
  totalClassrooms: number;
  totalLessons: number;
  recentTeachers: TeacherAccount[];
  recentClassrooms: Classroom[];
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    actor: string;
  }>;
}

export const adminService = {
  async getTeachers(): Promise<TeacherAccount[]> {
    const profiles = await authService.getProfiles();
    const teacherProfiles = profiles.filter((p) => p.role === 'teacher');
    const classrooms = await classroomService.getClassrooms();
    const lessons = await lessonService.getLessons();

    return teacherProfiles.map((p) => {
      const teacherClassrooms = classrooms.filter(
        (c) => c.teacher_id === p.id || c.teacherName?.toLowerCase() === p.display_name.toLowerCase()
      );
      return {
        id: p.id,
        name: p.display_name,
        email: p.email,
        teacher_code: p.teacher_code || 'TCH-001',
        role: 'teacher',
        department: p.department || 'Curriculum & Instruction',
        status: p.status,
        invitedAt: p.created_at,
        classroomCount: teacherClassrooms.length,
        lessonCount: lessons.length // In schoolwide system
      };
    });
  },

  async inviteTeacher(data: {
    name: string;
    email: string;
    department?: string;
    password: string;
  }): Promise<TeacherAccount> {
    return this.createTeacher({
      name: data.name,
      email: data.email,
      teacherId: `TCH-${Math.floor(100 + Math.random() * 900)}`,
      department: data.department,
      password: data.password
    });
  },

  async createTeacher(data: {
    name: string;
    email: string;
    teacherId: string;
    department?: string;
    password: string;
  }): Promise<TeacherAccount> {
    const profile = await authService.createTeacherAccount({
      name: data.name,
      email: data.email,
      teacherCode: data.teacherId,
      department: data.department,
      password: data.password
    });

    return {
      id: profile.id,
      name: profile.display_name,
      email: profile.email,
      teacher_code: profile.teacher_code || data.teacherId,
      role: 'teacher',
      department: profile.department || 'Curriculum & Instruction',
      status: profile.status,
      invitedAt: profile.created_at,
      classroomCount: 0,
      lessonCount: 0
    };
  },

  async toggleTeacherStatus(teacherId: string): Promise<TeacherAccount | null> {
    const updated = await authService.toggleTeacherStatus(teacherId);
    if (!updated) return null;

    return {
      id: updated.id,
      name: updated.display_name,
      email: updated.email,
      teacher_code: updated.teacher_code,
      role: 'teacher',
      department: updated.department,
      status: updated.status,
      invitedAt: updated.created_at
    };
  },

  async deleteTeacher(teacherId: string, email?: string): Promise<void> {
    if (email) {
      await authService.deleteTeacherAccount(email);
    }
    await authService.deleteTeacherAccount(teacherId);
  },

  async getSystemOverview(): Promise<AdminSystemOverview> {
    const [teachers, classrooms, lessons, memberships, published, progress] = await Promise.all([
      this.getTeachers(),
      classroomService.getClassrooms(),
      lessonService.getLessons(),
      classroomService.getAllMemberships(),
      classroomService.getAllPublishedLessons(),
      classroomService.getAllStudentProgress()
    ]);

    // Unique students from memberships and progress
    const uniqueStudentIds = new Set<string>();
    memberships.forEach((m) => uniqueStudentIds.add(m.student_identifier.toLowerCase()));
    progress.forEach((p) => uniqueStudentIds.add(p.studentId.toLowerCase()));
    classrooms.forEach((c) => {
      if (c.studentCount) {
        for (let i = 0; i < c.studentCount; i++) {
          uniqueStudentIds.add(`${c.id}-stu-${i}`);
        }
      }
    });

    // Compile dynamic recent activity
    const activityList: AdminSystemOverview['recentActivity'] = [];

    // Lessons activity
    lessons.slice(0, 3).forEach((l) => {
      activityList.push({
        id: `act-les-${l.id}`,
        type: 'lesson_created',
        title: `Curriculum Package created: "${l.title}"`,
        timestamp: new Date(l.createdAt).toLocaleDateString(),
        actor: 'Teacher Portal'
      });
    });

    // Published activity
    published.slice(0, 3).forEach((p) => {
      activityList.push({
        id: `act-pub-${p.id}`,
        type: 'lesson_published',
        title: `Lesson published to ${p.classroomName || 'Classroom'} (Code: ${p.accessCode})`,
        timestamp: new Date(p.publishedAt).toLocaleDateString(),
        actor: 'Teacher'
      });
    });

    // Teachers activity
    teachers.slice(0, 3).forEach((t) => {
      activityList.push({
        id: `act-tch-${t.id}`,
        type: 'teacher_account',
        title: `Teacher account active: ${t.name} (${t.teacher_code || 'ID'})`,
        timestamp: new Date(t.invitedAt).toLocaleDateString(),
        actor: 'Master Admin'
      });
    });

    return {
      totalTeachers: teachers.length,
      totalStudents: uniqueStudentIds.size,
      totalClassrooms: classrooms.length,
      totalLessons: lessons.length,
      recentTeachers: teachers.slice(0, 5),
      recentClassrooms: classrooms.slice(0, 5),
      recentActivity: activityList.slice(0, 6)
    };
  }
};
