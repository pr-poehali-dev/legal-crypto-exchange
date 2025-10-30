-- Добавляем поля для системы подтверждения резерваций
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '3 minutes',
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON reservations(expires_at);

COMMENT ON COLUMN reservations.status IS 'Статус резервации: pending/confirmed/rejected/expired';
COMMENT ON COLUMN reservations.expires_at IS 'Время истечения ожидания подтверждения (3 минуты)';