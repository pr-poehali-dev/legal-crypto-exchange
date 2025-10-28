ALTER TABLE offers DROP CONSTRAINT offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check CHECK (status IN ('active', 'inactive', 'completed', 'reserved'));