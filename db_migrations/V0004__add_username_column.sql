ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
UPDATE users SET username = name WHERE username IS NULL;