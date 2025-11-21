-- Insert Skills
INSERT INTO public.skills (name, category) VALUES
('Java Programming', 'technical'),
('Spring Boot', 'technical'),
('SQL', 'technical'),
('REST APIs', 'technical'),
('Git', 'technical'),
('Unit Testing', 'technical'),
('Problem Solving', 'soft'),
('Communication', 'soft'),
('Teamwork', 'soft');

-- Insert Job Roles
INSERT INTO public.job_roles (title, description, level) VALUES
('Junior Java Developer', 'Entry-level Java developer role', 'junior'),
('Mid-Level Java Developer', 'Experienced Java developer role', 'mid'),
('Senior Java Developer', 'Senior Java developer role', 'senior');

-- Link Skills to Roles (Junior Java Developer)
WITH role AS (SELECT id FROM public.job_roles WHERE title = 'Junior Java Developer'),
     s1 AS (SELECT id FROM public.skills WHERE name = 'Java Programming'),
     s2 AS (SELECT id FROM public.skills WHERE name = 'Spring Boot'),
     s3 AS (SELECT id FROM public.skills WHERE name = 'SQL'),
     s4 AS (SELECT id FROM public.skills WHERE name = 'REST APIs'),
     s5 AS (SELECT id FROM public.skills WHERE name = 'Problem Solving')
INSERT INTO public.role_skills (role_id, skill_id, required_level)
SELECT role.id, s1.id, 3 FROM role, s1
UNION ALL
SELECT role.id, s2.id, 2 FROM role, s2
UNION ALL
SELECT role.id, s3.id, 3 FROM role, s3
UNION ALL
SELECT role.id, s4.id, 2 FROM role, s4
UNION ALL
SELECT role.id, s5.id, 3 FROM role, s5;
