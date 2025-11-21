-- Check current user role (you'll need to run this in SQL editor where you are logged in, or I can list all users)
-- Since I can't see the currently logged in user in SQL editor directly without auth.uid(), I will list all users and their roles.

SELECT id, email, role FROM public.users;

-- List all promotion requests to see if any exist
SELECT * FROM public.promotion_requests;
