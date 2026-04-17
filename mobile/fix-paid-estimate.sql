-- Fix the paid estimate for the £2 payment
UPDATE estimates 
SET 
  paid = true,
  stripe_payment_id = 'pi_3SIBCfGXvol7tjT23jxM03z5',
  payment_id = 'cs_1SIBChGXvol7tjT2yKO9k7J9',
  customer_email = 'a2b.solutions@yahoo.co.uk'
WHERE id = 'a3b6b12c-b7af-49c0-bd8c-1091ebfeedc9';
