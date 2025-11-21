-- 1. Insert New Advanced Skills (using NOT EXISTS to avoid duplicates)
INSERT INTO public.skills (name, category)
SELECT 'Microservices', 'technical'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Microservices');

INSERT INTO public.skills (name, category)
SELECT 'Docker', 'technical'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Docker');

INSERT INTO public.skills (name, category)
SELECT 'Kubernetes', 'technical'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Kubernetes');

INSERT INTO public.skills (name, category)
SELECT 'System Design', 'technical'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'System Design');

INSERT INTO public.skills (name, category)
SELECT 'CI/CD Pipelines', 'technical'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'CI/CD Pipelines');

INSERT INTO public.skills (name, category)
SELECT 'Cloud Architecture (AWS)', 'technical'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Cloud Architecture (AWS)');

INSERT INTO public.skills (name, category)
SELECT 'Team Leadership', 'soft'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Team Leadership');

INSERT INTO public.skills (name, category)
SELECT 'Mentoring', 'soft'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Mentoring');

INSERT INTO public.skills (name, category)
SELECT 'Strategic Planning', 'soft'
WHERE NOT EXISTS (SELECT 1 FROM public.skills WHERE name = 'Strategic Planning');


-- 2. Insert New "Lead" Role (using NOT EXISTS)
INSERT INTO public.job_roles (title, description, level)
SELECT 'Lead Java Developer', 'Lead developer role managing technical direction', 'lead'
WHERE NOT EXISTS (SELECT 1 FROM public.job_roles WHERE title = 'Lead Java Developer');


-- 3. Link Skills to "Mid-Level Java Developer"
-- (Requires higher proficiency in basics + some new skills)
WITH role AS (SELECT id FROM public.job_roles WHERE title = 'Mid-Level Java Developer'),
     s_java AS (SELECT id FROM public.skills WHERE name = 'Java Programming'),
     s_spring AS (SELECT id FROM public.skills WHERE name = 'Spring Boot'),
     s_sql AS (SELECT id FROM public.skills WHERE name = 'SQL'),
     s_rest AS (SELECT id FROM public.skills WHERE name = 'REST APIs'),
     s_micro AS (SELECT id FROM public.skills WHERE name = 'Microservices'),
     s_docker AS (SELECT id FROM public.skills WHERE name = 'Docker'),
     s_unit AS (SELECT id FROM public.skills WHERE name = 'Unit Testing'),
     s_prob AS (SELECT id FROM public.skills WHERE name = 'Problem Solving')
INSERT INTO public.role_skills (role_id, skill_id, required_level)
SELECT role.id, s_java.id, 4 FROM role, s_java
UNION ALL
SELECT role.id, s_spring.id, 3 FROM role, s_spring
UNION ALL
SELECT role.id, s_sql.id, 4 FROM role, s_sql
UNION ALL
SELECT role.id, s_rest.id, 3 FROM role, s_rest
UNION ALL
SELECT role.id, s_micro.id, 2 FROM role, s_micro
UNION ALL
SELECT role.id, s_docker.id, 2 FROM role, s_docker
UNION ALL
SELECT role.id, s_unit.id, 3 FROM role, s_unit
UNION ALL
SELECT role.id, s_prob.id, 4 FROM role, s_prob
ON CONFLICT (role_id, skill_id) DO NOTHING;

-- 4. Link Skills to "Senior Java Developer"
-- (Mastery in basics + advanced skills)
WITH role AS (SELECT id FROM public.job_roles WHERE title = 'Senior Java Developer'),
     s_java AS (SELECT id FROM public.skills WHERE name = 'Java Programming'),
     s_spring AS (SELECT id FROM public.skills WHERE name = 'Spring Boot'),
     s_micro AS (SELECT id FROM public.skills WHERE name = 'Microservices'),
     s_sys AS (SELECT id FROM public.skills WHERE name = 'System Design'),
     s_cloud AS (SELECT id FROM public.skills WHERE name = 'Cloud Architecture (AWS)'),
     s_k8s AS (SELECT id FROM public.skills WHERE name = 'Kubernetes'),
     s_ment AS (SELECT id FROM public.skills WHERE name = 'Mentoring')
INSERT INTO public.role_skills (role_id, skill_id, required_level)
SELECT role.id, s_java.id, 5 FROM role, s_java
UNION ALL
SELECT role.id, s_spring.id, 5 FROM role, s_spring
UNION ALL
SELECT role.id, s_micro.id, 4 FROM role, s_micro
UNION ALL
SELECT role.id, s_sys.id, 4 FROM role, s_sys
UNION ALL
SELECT role.id, s_cloud.id, 3 FROM role, s_cloud
UNION ALL
SELECT role.id, s_k8s.id, 3 FROM role, s_k8s
UNION ALL
SELECT role.id, s_ment.id, 4 FROM role, s_ment
ON CONFLICT (role_id, skill_id) DO NOTHING;

-- 5. Link Skills to "Lead Java Developer"
-- (Focus on Architecture and Leadership)
WITH role AS (SELECT id FROM public.job_roles WHERE title = 'Lead Java Developer'),
     s_sys AS (SELECT id FROM public.skills WHERE name = 'System Design'),
     s_cloud AS (SELECT id FROM public.skills WHERE name = 'Cloud Architecture (AWS)'),
     s_lead AS (SELECT id FROM public.skills WHERE name = 'Team Leadership'),
     s_strat AS (SELECT id FROM public.skills WHERE name = 'Strategic Planning'),
     s_ment AS (SELECT id FROM public.skills WHERE name = 'Mentoring')
INSERT INTO public.role_skills (role_id, skill_id, required_level)
SELECT role.id, s_sys.id, 5 FROM role, s_sys
UNION ALL
SELECT role.id, s_cloud.id, 5 FROM role, s_cloud
UNION ALL
SELECT role.id, s_lead.id, 5 FROM role, s_lead
UNION ALL
SELECT role.id, s_strat.id, 4 FROM role, s_strat
UNION ALL
SELECT role.id, s_ment.id, 5 FROM role, s_ment
ON CONFLICT (role_id, skill_id) DO NOTHING;
