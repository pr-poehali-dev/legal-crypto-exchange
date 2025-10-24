-- Создаем специального системного пользователя для анонимных объявлений
INSERT INTO t_p53513159_legal_crypto_exchang.users 
(name, email, username, phone, password_hash, blocked)
SELECT 'Anonymous System', 'anonymous@system.local', 'anonymous_system', '+00000000000', 'no_password', false
WHERE NOT EXISTS (
    SELECT 1 FROM t_p53513159_legal_crypto_exchang.users WHERE email = 'anonymous@system.local'
);