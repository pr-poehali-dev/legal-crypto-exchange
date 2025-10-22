-- Update admin password to correct hash
UPDATE users 
SET password_hash = '42fc03eca424559d2118922c14ff13bf9fbe1104d41a076381723c4157a193a0'
WHERE email = 'admin@kuzbassexchange.ru';