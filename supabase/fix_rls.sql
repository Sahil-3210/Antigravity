-- Allow employees to insert their own learning paths (needed for auto-generation)
create policy "Employees can insert own learning paths" on public.learning_paths for insert with check (auth.uid() = user_id);
