-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  person_id uuid,
  process_id uuid,
  token text UNIQUE,
  status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  started_at timestamp without time zone,
  CONSTRAINT candidates_pkey PRIMARY KEY (id),
  CONSTRAINT candidates_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.persons(id),
  CONSTRAINT candidates_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.processes(id)
);
CREATE TABLE public.client_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  client_id uuid,
  CONSTRAINT client_users_pkey PRIMARY KEY (id),
  CONSTRAINT client_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT client_users_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status text DEFAULT 'active'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.combo_tests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  combo_id uuid,
  test_id uuid,
  CONSTRAINT combo_tests_pkey PRIMARY KEY (id),
  CONSTRAINT combo_tests_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.combos(id),
  CONSTRAINT combo_tests_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.combos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid,
  name text,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT combos_pkey PRIMARY KEY (id),
  CONSTRAINT combos_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.competencies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text,
  created_at timestamp without time zone DEFAULT now(),
  definition text,
  inter_alejado text,
  inter_cercano text,
  inter_adecuado text,
  profile_alejado text,
  profile_cercano text,
  profile_adecuado text,
  empathy text,
  areas_for_improvement text,
  CONSTRAINT competencies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.competency_results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  candidate_id uuid,
  competency_id uuid,
  score numeric,
  CONSTRAINT competency_results_pkey PRIMARY KEY (id),
  CONSTRAINT competency_results_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT competency_results_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id)
);
CREATE TABLE public.dimension_competency_map (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dimension_id uuid,
  competency_id uuid,
  weight numeric DEFAULT 1,
  CONSTRAINT dimension_competency_map_pkey PRIMARY KEY (id),
  CONSTRAINT dimension_competency_map_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id),
  CONSTRAINT dimension_competency_map_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id)
);
CREATE TABLE public.dimensions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  test_id uuid,
  name text,
  code text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT dimensions_pkey PRIMARY KEY (id),
  CONSTRAINT dimensions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.interpretations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dimension_id uuid,
  min_score numeric,
  max_score numeric,
  positive_text text,
  negative_text text,
  CONSTRAINT interpretations_pkey PRIMARY KEY (id),
  CONSTRAINT interpretations_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id)
);
CREATE TABLE public.options (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question_id uuid,
  text text,
  value numeric,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT options_pkey PRIMARY KEY (id),
  CONSTRAINT options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.persons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT persons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.processes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid,
  combo_id uuid,
  name text,
  start_date timestamp without time zone,
  end_date timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT processes_pkey PRIMARY KEY (id),
  CONSTRAINT processes_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT processes_combo_id_fkey FOREIGN KEY (combo_id) REFERENCES public.combos(id)
);
CREATE TABLE public.question_dimension_map (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question_id uuid,
  option_id uuid,
  dimension_id uuid,
  weight numeric DEFAULT 1,
  CONSTRAINT question_dimension_map_pkey PRIMARY KEY (id),
  CONSTRAINT question_dimension_map_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT question_dimension_map_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.options(id),
  CONSTRAINT question_dimension_map_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  test_id uuid,
  text text NOT NULL,
  type text,
  order_index integer,
  created_at timestamp without time zone DEFAULT now(),
  active boolean NOT NULL DEFAULT false,
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.responses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  candidate_id uuid,
  question_id uuid,
  option_id uuid,
  value numeric,
  answered_at timestamp without time zone DEFAULT now(),
  CONSTRAINT responses_pkey PRIMARY KEY (id),
  CONSTRAINT responses_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT responses_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.options(id)
);
CREATE TABLE public.results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  candidate_id uuid,
  dimension_id uuid,
  score numeric,
  CONSTRAINT results_pkey PRIMARY KEY (id),
  CONSTRAINT results_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT results_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id)
);
CREATE TABLE public.scoring_formulas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  test_id uuid,
  dimension_id uuid,
  formula text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT scoring_formulas_pkey PRIMARY KEY (id),
  CONSTRAINT scoring_formulas_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id),
  CONSTRAINT scoring_formulas_dimension_id_fkey FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id)
);
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid,
  name text NOT NULL,
  description text,
  type text,
  duration_minutes integer,
  scoring_type text CHECK (scoring_type = ANY (ARRAY['formula'::text, 'mapping'::text, 'hybrid'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT tests_pkey PRIMARY KEY (id),
  CONSTRAINT tests_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'client'::text, 'candidate'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);