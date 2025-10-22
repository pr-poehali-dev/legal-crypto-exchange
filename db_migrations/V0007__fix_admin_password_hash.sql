-- Fix admin password hash to include # symbol
-- Hash for 'Kzb2025!Secure#' with # symbol
UPDATE users 
SET password_hash = '7e9a799709bf6ca62e2ee1201319bae0ecb043ae36b25bcd75c41ec65c9d1241'
WHERE email = 'admin@kuzbassexchange.ru';