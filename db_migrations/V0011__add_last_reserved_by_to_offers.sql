-- Add columns to store last reservation info before cancellation
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS last_reserved_by INTEGER,
ADD COLUMN IF NOT EXISTS last_reserved_at TIMESTAMP;