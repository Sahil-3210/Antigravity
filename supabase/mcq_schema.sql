-- Questions Table
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  skill_id uuid references public.skills(id) on delete cascade not null,
  question_text text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Options Table
create table public.question_options (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  option_text text not null,
  is_correct boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.questions enable row level security;
alter table public.question_options enable row level security;

-- Everyone can read questions (for taking tests) - In a real app, you might restrict this more
create policy "Public read questions" on public.questions for select using (true);
create policy "Public read options" on public.question_options for select using (true);

-- Only admins can manage questions
create policy "Admins manage questions" on public.questions for all using (public.is_admin());
create policy "Admins manage options" on public.question_options for all using (public.is_admin());

-- SEED DATA FOR JAVA QUESTIONS
-- We need to get the skill_id for 'Java Programming'. 
-- Since we can't use variables easily in simple SQL scripts without PL/pgSQL blocks, 
-- we will use a DO block to insert sample data.

DO $$
DECLARE
  java_skill_id uuid;
  q1_id uuid;
  q2_id uuid;
  q3_id uuid;
BEGIN
  -- Find the skill ID for 'Java Programming'
  SELECT id INTO java_skill_id FROM public.skills WHERE name = 'Java Programming' LIMIT 1;

  IF java_skill_id IS NOT NULL THEN
    -- Question 1
    INSERT INTO public.questions (skill_id, question_text, difficulty)
    VALUES (java_skill_id, 'What is the output of System.out.println(1 + 2 + "3"); ?', 'easy')
    RETURNING id INTO q1_id;

    INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
    (q1_id, '33', true),
    (q1_id, '123', false),
    (q1_id, '6', false),
    (q1_id, 'Error', false);

    -- Question 2
    INSERT INTO public.questions (skill_id, question_text, difficulty)
    VALUES (java_skill_id, 'Which keyword is used to prevent method overriding in Java?', 'medium')
    RETURNING id INTO q2_id;

    INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
    (q2_id, 'static', false),
    (q2_id, 'final', true),
    (q2_id, 'abstract', false),
    (q2_id, 'const', false);

    -- Question 3
    INSERT INTO public.questions (skill_id, question_text, difficulty)
    VALUES (java_skill_id, 'What is the default value of a boolean variable in Java?', 'easy')
    RETURNING id INTO q3_id;

    INSERT INTO public.question_options (question_id, option_text, is_correct) VALUES
    (q3_id, 'true', false),
    (q3_id, 'false', true),
    (q3_id, 'null', false),
    (q3_id, '0', false);
    
  END IF;
END $$;
