-- Добавляем поля для анонимных объявлений (только для покупки)
ALTER TABLE t_p53513159_legal_crypto_exchang.offers 
ADD COLUMN IF NOT EXISTS anonymous_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS anonymous_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Создаем индекс для быстрого поиска анонимных объявлений
CREATE INDEX IF NOT EXISTS idx_offers_anonymous ON t_p53513159_legal_crypto_exchang.offers(is_anonymous, status);

-- Добавляем constraint: анонимными могут быть только объявления на покупку
ALTER TABLE t_p53513159_legal_crypto_exchang.offers 
ADD CONSTRAINT check_anonymous_only_buy 
CHECK (
  (is_anonymous = false) OR 
  (is_anonymous = true AND offer_type = 'buy')
);

-- Constraint: если анонимное объявление, то должны быть заполнены имя и телефон
ALTER TABLE t_p53513159_legal_crypto_exchang.offers 
ADD CONSTRAINT check_anonymous_fields 
CHECK (
  (is_anonymous = false) OR 
  (is_anonymous = true AND anonymous_name IS NOT NULL AND anonymous_phone IS NOT NULL)
);