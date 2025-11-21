-- Add status and completed_at to learning_paths
ALTER TABLE public.learning_paths 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Update existing paths to be active
UPDATE public.learning_paths SET status = 'active' WHERE status IS NULL;
