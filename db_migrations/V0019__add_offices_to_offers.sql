-- Add offices column to offers table to store selected office addresses
ALTER TABLE t_p53513159_legal_crypto_exchang.offers 
ADD COLUMN offices TEXT[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN t_p53513159_legal_crypto_exchang.offers.offices IS 'Array of selected office addresses for the offer';