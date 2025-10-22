-- Add blocked field to users table for blocking user from creating offers
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;