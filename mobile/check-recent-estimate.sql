SELECT id, paid, created_at, stripe_payment_id, payment_id
FROM estimates
ORDER BY created_at DESC
LIMIT 3;
