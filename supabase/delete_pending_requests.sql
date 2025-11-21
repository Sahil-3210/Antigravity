-- Delete pending promotion requests for the current user (or all pending requests for cleanup)
DELETE FROM public.promotion_requests
WHERE status = 'pending';
