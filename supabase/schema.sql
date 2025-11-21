-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('admin', 'employee')) default 'employee',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Job Roles
create table public.job_roles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  level text check (level in ('junior', 'mid', 'senior', 'lead', 'manager')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Skills
create table public.skills (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text check (category in ('technical', 'soft')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Role Skills (Many-to-Many)
create table public.role_skills (
  id uuid default uuid_generate_v4() primary key,
  role_id uuid references public.job_roles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  required_level integer check (required_level between 1 and 5) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(role_id, skill_id)
);

-- Employee Roles (Current assignment)
create table public.employee_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  role_id uuid references public.job_roles(id) on delete cascade not null,
  assigned_by uuid references public.users(id),
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('active', 'completed')) default 'active',
  unique(user_id, role_id) -- Simplified: one active role per user usually, but history is good. For now, let's keep it simple.
);

-- Skill Assessments (Self-rating)
create table public.skill_assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  role_id uuid references public.job_roles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  self_rating integer check (self_rating between 1 and 5) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Learning Paths
create table public.learning_paths (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  role_id uuid references public.job_roles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  resource_title text not null,
  resource_url text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Test Attempts
create table public.test_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  role_id uuid references public.job_roles(id) on delete cascade not null,
  score integer not null,
  passed boolean default false,
  attempt_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Promotion Requests
create table public.promotion_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  current_role_id uuid references public.job_roles(id) on delete cascade not null,
  requested_role_id uuid references public.job_roles(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamp with time zone
);

-- RLS Policies (Basic Setup)
alter table public.users enable row level security;
alter table public.job_roles enable row level security;
alter table public.skills enable row level security;
alter table public.role_skills enable row level security;
alter table public.employee_roles enable row level security;
alter table public.skill_assessments enable row level security;
alter table public.learning_paths enable row level security;
alter table public.test_attempts enable row level security;
alter table public.promotion_requests enable row level security;

-- Public read access for job roles and skills (simplified for now)
create policy "Public read job_roles" on public.job_roles for select using (true);
create policy "Public read skills" on public.skills for select using (true);
create policy "Public read role_skills" on public.role_skills for select using (true);

-- Users can read their own data
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- Admin policies (This assumes we have a way to check admin status, often done via a custom claim or a function. 
-- For simplicity in this MVP, we might rely on the 'role' column in the public.users table, 
-- BUT RLS checking a column in the same table can be tricky due to infinite recursion if not careful.
-- A common pattern is to use a separate 'admin_users' table or custom claims.
-- For this MVP, let's allow read/write if the user has role 'admin' in the public.users table.
-- WARNING: This is slightly less secure if not handled carefully, but okay for MVP.)

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Admin Access Policies
create policy "Admins can do everything" on public.users for all using (public.is_admin());
create policy "Admins can do everything job_roles" on public.job_roles for all using (public.is_admin());
create policy "Admins can do everything skills" on public.skills for all using (public.is_admin());
create policy "Admins can do everything role_skills" on public.role_skills for all using (public.is_admin());
create policy "Admins can do everything employee_roles" on public.employee_roles for all using (public.is_admin());
create policy "Admins can do everything skill_assessments" on public.skill_assessments for all using (public.is_admin());
create policy "Admins can do everything learning_paths" on public.learning_paths for all using (public.is_admin());
create policy "Admins can do everything test_attempts" on public.test_attempts for all using (public.is_admin());
create policy "Admins can do everything promotion_requests" on public.promotion_requests for all using (public.is_admin());

-- Employee specific policies
-- Employee Roles
create policy "Employees can read own roles" on public.employee_roles for select using (auth.uid() = user_id);

-- Skill Assessments
create policy "Employees can CRUD own assessments" on public.skill_assessments for all using (auth.uid() = user_id);

-- Learning Paths
create policy "Employees can read own learning paths" on public.learning_paths for select using (auth.uid() = user_id);
create policy "Employees can update own learning paths" on public.learning_paths for update using (auth.uid() = user_id);

-- Test Attempts
create policy "Employees can read own test attempts" on public.test_attempts for select using (auth.uid() = user_id);
create policy "Employees can insert own test attempts" on public.test_attempts for insert with check (auth.uid() = user_id);

-- Promotion Requests
create policy "Employees can read own requests" on public.promotion_requests for select using (auth.uid() = user_id);
create policy "Employees can insert own requests" on public.promotion_requests for insert with check (auth.uid() = user_id);

-- Handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
