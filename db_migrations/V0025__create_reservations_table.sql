CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id),
    buyer_name VARCHAR(255),
    buyer_phone VARCHAR(50),
    buyer_user_id INTEGER REFERENCES users(id),
    meeting_office TEXT,
    meeting_time VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);