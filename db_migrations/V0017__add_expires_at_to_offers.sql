-- Добавляем поле expires_at для автоматического удаления старых объявлений
ALTER TABLE t_p53513159_legal_crypto_exchang.offers 
ADD COLUMN expires_at TIMESTAMP;

-- Заполняем expires_at для существующих объявлений (created_at + 24 часа)
UPDATE t_p53513159_legal_crypto_exchang.offers 
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL;

-- Создаем индекс для быстрого поиска истекших объявлений
CREATE INDEX idx_offers_expires_at ON t_p53513159_legal_crypto_exchang.offers(expires_at) 
WHERE status != 'completed';