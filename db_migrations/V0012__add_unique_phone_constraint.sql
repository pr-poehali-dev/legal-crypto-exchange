-- Add unique constraint and index for phone numbers
ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
CREATE INDEX idx_users_phone ON users(phone);