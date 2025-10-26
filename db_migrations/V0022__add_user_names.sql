-- Добавление полей first_name и last_name в таблицу users
ALTER TABLE t_p53513159_legal_crypto_exchang.users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Обновление username на основе имени и фамилии (для будущих записей)
-- Временно заполняем тестовыми данными для существующих пользователей
UPDATE t_p53513159_legal_crypto_exchang.users 
SET first_name = 'Иван', last_name = 'Иванов'
WHERE id = 4;

UPDATE t_p53513159_legal_crypto_exchang.users 
SET first_name = 'Петр', last_name = 'Петров'
WHERE id = 7;