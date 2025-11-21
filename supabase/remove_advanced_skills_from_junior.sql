-- Remove Docker and Microservices skills from Junior Java Developer role
-- First, get the role_id for 'Junior Java Developer'
-- Then get skill_ids for 'Docker' and 'Microservices'
-- Then delete from role_skills

DELETE FROM public.role_skills
WHERE role_id IN (SELECT id FROM public.job_roles WHERE title = 'Junior Java Developer')
AND skill_id IN (SELECT id FROM public.skills WHERE name IN ('Docker', 'Microservices', 'Kubernetes', 'System Design'));
