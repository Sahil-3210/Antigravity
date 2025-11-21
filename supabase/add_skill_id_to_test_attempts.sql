-- Add skill_id column to test_attempts table
ALTER TABLE public.test_attempts
ADD COLUMN skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE;

-- We should probably make it NOT NULL eventually, but for existing records (if any) it would be null.
-- Since we are in dev, we can try to make it not null if we want, but let's just add it for now.
-- Actually, let's make it nullable for now to avoid issues with existing data, 
-- or if we want to enforce it, we'd need to truncate the table or provide a default.
-- Given the user is facing errors inserting, the table might be empty or have invalid data.
-- Let's just add it.
