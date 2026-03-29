
-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- =========================
-- USERS (extends auth.users)
-- =========================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text check (role in ('admin','client','candidate')) not null,
  created_at timestamp default now()
);

-- =========================
-- PERSONS (real people)
-- =========================
create table if not exists public.persons (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  created_at timestamp default now()
);

-- =========================
-- CLIENTS
-- =========================
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text default 'active',
  created_at timestamp default now()
);

create table if not exists public.client_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade
);

-- =========================
-- TESTS
-- =========================
create table if not exists public.tests (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade,
  name text not null,
  description text,
  type text,
  duration_minutes int,
  scoring_type text check (scoring_type in ('formula','mapping','hybrid')),
  created_at timestamp default now()
);

-- =========================
-- QUESTIONS
-- =========================
create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid references public.tests(id) on delete cascade,
  text text not null,
  type text,
  order_index int,
  created_at timestamp default now()
);

-- =========================
-- OPTIONS
-- =========================
create table if not exists public.options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references public.questions(id) on delete cascade,
  text text,
  value numeric,
  created_at timestamp default now()
);

-- =========================
-- DIMENSIONS
-- =========================
create table if not exists public.dimensions (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid references public.tests(id) on delete cascade,
  name text,
  code text,
  created_at timestamp default now()
);

-- =========================
-- QUESTION-DIMENSION MAP
-- =========================
create table if not exists public.question_dimension_map (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references public.questions(id) on delete cascade,
  option_id uuid references public.options(id) on delete cascade,
  dimension_id uuid references public.dimensions(id) on delete cascade,
  weight numeric default 1
);

-- =========================
-- SCORING FORMULAS
-- =========================
create table if not exists public.scoring_formulas (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid references public.tests(id) on delete cascade,
  dimension_id uuid references public.dimensions(id) on delete cascade,
  formula text,
  created_at timestamp default now()
);

-- =========================
-- COMPETENCIES
-- =========================
create table if not exists public.competencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  created_at timestamp default now()
);

-- =========================
-- DIMENSION-COMPETENCY MAP
-- =========================
create table if not exists public.dimension_competency_map (
  id uuid primary key default uuid_generate_v4(),
  dimension_id uuid references public.dimensions(id) on delete cascade,
  competency_id uuid references public.competencies(id) on delete cascade,
  weight numeric default 1
);

-- =========================
-- COMBOS
-- =========================
create table if not exists public.combos (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade,
  name text,
  description text,
  created_at timestamp default now()
);

create table if not exists public.combo_tests (
  id uuid primary key default uuid_generate_v4(),
  combo_id uuid references public.combos(id) on delete cascade,
  test_id uuid references public.tests(id) on delete cascade
);

-- =========================
-- PROCESSES
-- =========================
create table if not exists public.processes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  combo_id uuid references public.combos(id),
  name text,
  start_date timestamp,
  end_date timestamp,
  created_at timestamp default now()
);

-- =========================
-- CANDIDATES (per process)
-- =========================
create table if not exists public.candidates (
  id uuid primary key default uuid_generate_v4(),
  person_id uuid references public.persons(id),
  process_id uuid references public.processes(id) on delete cascade,
  token text unique,
  status text default 'pending',
  created_at timestamp default now()
);

-- =========================
-- RESPONSES
-- =========================
create table if not exists public.responses (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  option_id uuid references public.options(id),
  value numeric,
  answered_at timestamp default now(),
  unique(candidate_id, question_id)
);

-- =========================
-- RESULTS (dimensions)
-- =========================
create table if not exists public.results (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  dimension_id uuid references public.dimensions(id),
  score numeric
);

-- =========================
-- COMPETENCY RESULTS
-- =========================
create table if not exists public.competency_results (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  competency_id uuid references public.competencies(id),
  score numeric
);

-- =========================
-- INTERPRETATIONS
-- =========================
create table if not exists public.interpretations (
  id uuid primary key default uuid_generate_v4(),
  dimension_id uuid references public.dimensions(id),
  min_score numeric,
  max_score numeric,
  positive_text text,
  negative_text text
);

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_questions_test on public.questions(test_id);
create index if not exists idx_options_question on public.options(question_id);
create index if not exists idx_responses_candidate on public.responses(candidate_id);
create index if not exists idx_results_candidate on public.results(candidate_id);
create index if not exists idx_candidates_process on public.candidates(process_id);

-- =========================
-- RLS ENABLE
-- =========================
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.tests enable row level security;
alter table public.combos enable row level security;
alter table public.processes enable row level security;
alter table public.candidates enable row level security;
alter table public.responses enable row level security;

-- =========================
-- BASIC POLICY
-- =========================
create policy "Users can see themselves"
on public.users
for select
using (auth.uid() = id);

-- =========================
-- MULTI-TENANT POLICIES
-- =========================
create policy "Users see their clients"
on public.clients
for select
using (id in (select client_id from public.client_users where user_id = auth.uid()));

create policy "Users see their processes"
on public.processes
for all
using (client_id in (select client_id from public.client_users where user_id = auth.uid()));

create policy "Global tests and private client tests"
on public.tests
for select
using (
  client_id is null or 
  client_id in (select client_id from public.client_users where user_id = auth.uid())
);

-- =========================
-- AUTH TRIGGER FOR NEW USERS
-- =========================
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  default_role text;
begin
  -- If the email belongs to your company domain, make them auto-admin
  if new.email like '%@tuempresa.com' then
    default_role := 'admin';
  else
    default_role := 'client';
  end if;

  insert into public.users (id, email, role)
  values (new.id, new.email, default_role);
  
  -- Optionally: Auto-create a Client organization and map it here
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
 