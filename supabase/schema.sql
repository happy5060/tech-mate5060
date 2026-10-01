-- ==============================================================================
-- AI Classroom Creator — Supabase Database Schema
-- Table: lessons
-- ==============================================================================

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";

-- Create lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default null,
  title text not null,
  subject text not null,
  topic text not null,
  class_level text not null,
  duration text not null,
  learning_objective text not null,
  teaching_style text not null,
  difficulty text not null,
  language text not null default 'English',
  lesson_content jsonb not null,
  alignment_results jsonb default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments on table and columns
comment on table public.lessons is 'Stores generated and edited pedagogical lesson packages for educators.';
comment on column public.lessons.lesson_content is 'Structured JSON holding introduction, learning_objectives, concept_explanation, examples, classroom_activity, discussion_questions, assessment, and conclusion.';
comment on column public.lessons.alignment_results is 'Structured JSON holding learning objective alignment analysis per section.';

-- Indexes for search, filtering, and ordering
create index if not exists idx_lessons_subject on public.lessons (subject);
create index if not exists idx_lessons_class_level on public.lessons (class_level);
create index if not exists idx_lessons_updated_at on public.lessons (updated_at desc);
create index if not exists idx_lessons_user_id on public.lessons (user_id);

-- Enable Row Level Security (RLS)
alter table public.lessons enable row level security;

-- Permissive development policies (allowing anonymous / authenticated access)
create policy "Allow public read on lessons"
  on public.lessons for select
  using (true);

create policy "Allow public insert on lessons"
  on public.lessons for insert
  with check (true);

create policy "Allow public update on lessons"
  on public.lessons for update
  using (true);

create policy "Allow public delete on lessons"
  on public.lessons for delete
  using (true);

-- Auto-update updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
  before update on public.lessons
  for each row
  execute function public.handle_updated_at();
