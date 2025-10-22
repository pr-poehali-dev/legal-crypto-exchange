CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    deal_type VARCHAR(10) NOT NULL CHECK (deal_type IN ('buy', 'sell')),
    amount DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    partner_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_created_at ON deals(created_at);
