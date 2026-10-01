-- ==============================================================================
-- AI Classroom Creator — Complete Platform Database Schema Expansion
-- Supports 3 Portals: Master Admin, Teacher, and Student
-- ==============================================================================

-- Ensure uuid-ossp extension is enabled
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Master Admin, Teachers, and optional Student accounts)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher', 'student')),
  display_name text not null,
  email text not null unique,
  teacher_code text default null, -- e.g. TCH-001
  department text default null,
  status text not null default 'active' check (status in ('active', 'pending', 'disabled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.profiles is 'Stores user profile metadata tied to Supabase Auth roles: admin, teacher, student.';

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);

alter table public.profiles enable row level security;

-- Admin has full access to all profiles
create policy "Admins can view and manage all profiles"
  on public.profiles for all
  using (
    auth.jwt() ->> 'role' = 'service_role' or
    exists (
      select 1 from public.profiles p
      where p.auth_user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Teachers and Students can view their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth_user_id = auth.uid() or auth.uid() is null);

-- ------------------------------------------------------------------------------
-- 2. CLASSROOMS
-- ------------------------------------------------------------------------------
create table if not exists public.classrooms (
  id text primary key,
  teacher_id uuid references public.profiles(id) on delete set null,
  teacher_name text,
  name text not null,
  subject text not null,
  class_level text not null,
  class_code text not null unique, -- e.g. BIO9A7K, MATH82P, PHY91XZ
  description text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.classrooms is 'Classrooms managed by teachers with unique student join codes.';

create index if not exists idx_classrooms_class_code on public.classrooms(class_code);
create index if not exists idx_classrooms_teacher_id on public.classrooms(teacher_id);

alter table public.classrooms enable row level security;

create policy "Allow read on classrooms"
  on public.classrooms for select
  using (true);

create policy "Allow insert on classrooms"
  on public.classrooms for insert
  with check (true);

create policy "Allow update on classrooms"
  on public.classrooms for update
  using (true);

create policy "Allow delete on classrooms"
  on public.classrooms for delete
  using (true);

-- ------------------------------------------------------------------------------
-- 3. PUBLISHED LESSONS (Classroom ↔ Lesson Relationship)
-- ------------------------------------------------------------------------------
create table if not exists public.published_lessons (
  id text primary key,
  lesson_id uuid references public.lessons(id) on delete cascade,
  classroom_id text references public.classrooms(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  classroom_name text,
  access_code text not null,
  title text not null,
  subject text not null,
  class_level text not null,
  lesson_data jsonb default null,
  allow_chat boolean default true,
  allow_test_mode boolean default true,
  is_active boolean default true,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.published_lessons is 'Lessons published by teachers to specific classrooms for student access.';

create index if not exists idx_published_lessons_classroom on public.published_lessons(classroom_id);
create index if not exists idx_published_lessons_lesson on public.published_lessons(lesson_id);
create index if not exists idx_published_lessons_access_code on public.published_lessons(access_code);

alter table public.published_lessons enable row level security;

create policy "Allow read on published_lessons"
  on public.published_lessons for select
  using (true);

create policy "Allow insert on published_lessons"
  on public.published_lessons for insert
  with check (true);

create policy "Allow update on published_lessons"
  on public.published_lessons for update
  using (true);

create policy "Allow delete on published_lessons"
  on public.published_lessons for delete
  using (true);

-- ------------------------------------------------------------------------------
-- 4. STUDENT CLASSROOM MEMBERSHIPS
-- ------------------------------------------------------------------------------
create table if not exists public.student_classroom_memberships (
  id text primary key,
  classroom_id text references public.classrooms(id) on delete cascade,
  student_name text not null,
  student_identifier text not null, -- Roll number / Student ID e.g. 24BCA001
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.student_classroom_memberships is 'Records of students enrolled/joined into specific classrooms.';

create index if not exists idx_student_memberships_classroom on public.student_classroom_memberships(classroom_id);
create index if not exists idx_student_memberships_identifier on public.student_classroom_memberships(student_identifier);

alter table public.student_classroom_memberships enable row level security;

create policy "Allow read on student_classroom_memberships"
  on public.student_classroom_memberships for select
  using (true);

create policy "Allow insert on student_classroom_memberships"
  on public.student_classroom_memberships for insert
  with check (true);

-- ------------------------------------------------------------------------------
-- 5. STUDENT PROGRESS
-- ------------------------------------------------------------------------------
create table if not exists public.student_progress (
  id text primary key,
  student_name text not null,
  student_id text not null,
  classroom_id text not null,
  lesson_id text not null,
  published_lesson_id text default null,
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Completed')),
  progress_percentage integer default 0,
  assessment_attempted boolean default false,
  assessment_score integer default null,
  assessment_max_score integer default null,
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone default null,
  last_active_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.student_progress is 'Tracks individual student progress and completion on lesson packages.';

create index if not exists idx_student_progress_classroom on public.student_progress(classroom_id);
create index if not exists idx_student_progress_lesson on public.student_progress(lesson_id);
create index if not exists idx_student_progress_student on public.student_progress(student_id);

alter table public.student_progress enable row level security;

create policy "Allow read on student_progress"
  on public.student_progress for select
  using (true);

create policy "Allow insert or update on student_progress"
  on public.student_progress for all
  using (true);

-- ------------------------------------------------------------------------------
-- 6. ASSESSMENT ATTEMPTS
-- ------------------------------------------------------------------------------
create table if not exists public.assessment_attempts (
  id text primary key,
  student_name text not null,
  student_id text not null,
  classroom_id text default null,
  lesson_id text not null,
  published_lesson_id text default null,
  score integer not null,
  total_questions integer not null,
  answers jsonb default '{}'::jsonb,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.assessment_attempts is 'Scores and answers from student quiz and assessment submissions.';

create index if not exists idx_assessment_attempts_student on public.assessment_attempts(student_id);
create index if not exists idx_assessment_attempts_lesson on public.assessment_attempts(lesson_id);

alter table public.assessment_attempts enable row level security;

create policy "Allow read on assessment_attempts"
  on public.assessment_attempts for select
  using (true);

create policy "Allow insert on assessment_attempts"
  on public.assessment_attempts for insert
  with check (true);

-- ------------------------------------------------------------------------------
-- 7. LESSON RESOURCES (Approved YouTube & Manual Resources)
-- ------------------------------------------------------------------------------
create table if not exists public.lesson_resources (
  id text primary key,
  lesson_id text not null,
  type text not null default 'youtube',
  video_id text,
  title text not null,
  url text not null,
  thumbnail text default null,
  channel text default 'YouTube',
  duration text default 'Variable',
  added_by text default 'Teacher',
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.lesson_resources is 'Manual teacher-approved YouTube video links and supplementary resources.';

create index if not exists idx_lesson_resources_lesson on public.lesson_resources(lesson_id);

alter table public.lesson_resources enable row level security;

create policy "Allow read on lesson_resources"
  on public.lesson_resources for select
  using (true);

create policy "Allow insert or manage on lesson_resources"
  on public.lesson_resources for all
  using (true);
