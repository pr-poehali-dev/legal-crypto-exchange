CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  offer_type VARCHAR(10) NOT NULL CHECK (offer_type IN ('buy', 'sell')),
  amount DECIMAL(18, 2) NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  meeting_time TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
