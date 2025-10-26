-- Add fields for meeting details to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS offer_id INTEGER REFERENCES offers(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_id INTEGER REFERENCES users(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_name VARCHAR(255);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(50);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS meeting_office TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS meeting_time VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_deals_offer_id ON deals(offer_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON deals(buyer_id);
