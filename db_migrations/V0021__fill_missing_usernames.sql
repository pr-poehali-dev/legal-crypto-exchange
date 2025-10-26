-- Заполнение username для пользователей без имени
UPDATE t_p53513159_legal_crypto_exchang.users 
SET username = 'Пользователь ' || SUBSTRING(phone FROM 8 FOR 4) 
WHERE username IS NULL;