-- Replace 'YOUR_ADMIN_EMAIL@EXAMPLE.COM' with the actual email of the admin user
UPDATE public.users
SET role = 'admin'
WHERE email = 'YOUR_ADMIN_EMAIL@EXAMPLE.COM';

-- Verify the change
SELECT email, role FROM public.users WHERE role = 'admin';
