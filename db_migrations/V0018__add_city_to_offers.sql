-- Add city column to offers table
ALTER TABLE t_p53513159_legal_crypto_exchang.offers 
ADD COLUMN city VARCHAR(50) NOT NULL DEFAULT 'Москва';

-- Add index for faster filtering by city
CREATE INDEX idx_offers_city ON t_p53513159_legal_crypto_exchang.offers(city);