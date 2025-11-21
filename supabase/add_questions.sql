-- Insert Questions for New Skills

-- 1. Microservices
WITH skill AS (SELECT id FROM public.skills WHERE name = 'Microservices')
INSERT INTO public.questions (skill_id, question_text, difficulty)
SELECT id, 'What is a key characteristic of Microservices architecture?', 'medium' FROM skill
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE question_text = 'What is a key characteristic of Microservices architecture?');

WITH q AS (SELECT id FROM public.questions WHERE question_text = 'What is a key characteristic of Microservices architecture?')
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT id, 'Monolithic codebase', false FROM q UNION ALL
SELECT id, 'Shared database for all services', false FROM q UNION ALL
SELECT id, 'Loosely coupled and independently deployable services', true FROM q UNION ALL
SELECT id, 'Single point of failure', false FROM q
ON CONFLICT DO NOTHING;

WITH skill AS (SELECT id FROM public.skills WHERE name = 'Microservices')
INSERT INTO public.questions (skill_id, question_text, difficulty)
SELECT id, 'Which pattern is commonly used for inter-service communication?', 'medium' FROM skill
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE question_text = 'Which pattern is commonly used for inter-service communication?');

WITH q AS (SELECT id FROM public.questions WHERE question_text = 'Which pattern is commonly used for inter-service communication?')
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT id, 'MVC', false FROM q UNION ALL
SELECT id, 'API Gateway', true FROM q UNION ALL
SELECT id, 'Singleton', false FROM q UNION ALL
SELECT id, 'Observer', false FROM q
ON CONFLICT DO NOTHING;


-- 2. Docker
WITH skill AS (SELECT id FROM public.skills WHERE name = 'Docker')
INSERT INTO public.questions (skill_id, question_text, difficulty)
SELECT id, 'What is a Docker container?', 'easy' FROM skill
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE question_text = 'What is a Docker container?');

WITH q AS (SELECT id FROM public.questions WHERE question_text = 'What is a Docker container?')
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT id, 'A virtual machine', false FROM q UNION ALL
SELECT id, 'A lightweight, standalone, executable package of software', true FROM q UNION ALL
SELECT id, 'A database management system', false FROM q UNION ALL
SELECT id, 'A web server', false FROM q
ON CONFLICT DO NOTHING;

WITH skill AS (SELECT id FROM public.skills WHERE name = 'Docker')
INSERT INTO public.questions (skill_id, question_text, difficulty)
SELECT id, 'Which command lists running containers?', 'easy' FROM skill
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE question_text = 'Which command lists running containers?');

WITH q AS (SELECT id FROM public.questions WHERE question_text = 'Which command lists running containers?')
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT id, 'docker run', false FROM q UNION ALL
SELECT id, 'docker ps', true FROM q UNION ALL
SELECT id, 'docker images', false FROM q UNION ALL
SELECT id, 'docker build', false FROM q
ON CONFLICT DO NOTHING;


-- 3. Kubernetes
WITH skill AS (SELECT id FROM public.skills WHERE name = 'Kubernetes')
INSERT INTO public.questions (skill_id, question_text, difficulty)
SELECT id, 'What is a Pod in Kubernetes?', 'medium' FROM skill
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE question_text = 'What is a Pod in Kubernetes?');

WITH q AS (SELECT id FROM public.questions WHERE question_text = 'What is a Pod in Kubernetes?')
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT id, 'A storage volume', false FROM q UNION ALL
SELECT id, 'The smallest deployable unit of computing', true FROM q UNION ALL
SELECT id, 'A network load balancer', false FROM q UNION ALL
SELECT id, 'A master node', false FROM q
ON CONFLICT DO NOTHING;


-- 4. System Design
WITH skill AS (SELECT id FROM public.skills WHERE name = 'System Design')
INSERT INTO public.questions (skill_id, question_text, difficulty)
SELECT id, 'What does CAP theorem stand for?', 'hard' FROM skill
WHERE NOT EXISTS (SELECT 1 FROM public.questions WHERE question_text = 'What does CAP theorem stand for?');

WITH q AS (SELECT id FROM public.questions WHERE question_text = 'What does CAP theorem stand for?')
INSERT INTO public.question_options (question_id, option_text, is_correct)
SELECT id, 'Consistency, Availability, Partition Tolerance', true FROM q UNION ALL
SELECT id, 'Consistency, Availability, Performance', false FROM q UNION ALL
SELECT id, 'Capacity, Availability, Partition Tolerance', false FROM q UNION ALL
SELECT id, 'Consistency, Accuracy, Performance', false FROM q
ON CONFLICT DO NOTHING;
