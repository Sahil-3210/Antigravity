SELECT s.name 
FROM public.role_skills rs
JOIN public.skills s ON rs.skill_id = s.id
JOIN public.job_roles jr ON rs.role_id = jr.id
WHERE jr.title = 'Junior Java Developer';
