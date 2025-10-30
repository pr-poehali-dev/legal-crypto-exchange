-- Добавляем поля для временных промежутков в объявления
ALTER TABLE offers 
ADD COLUMN time_start TIME,
ADD COLUMN time_end TIME;

-- Создаём таблицу временных слотов (по 15 минут)
CREATE TABLE IF NOT EXISTS offer_time_slots (
  id SERIAL PRIMARY KEY,
  offer_id INTEGER NOT NULL REFERENCES offers(id),
  slot_time TIME NOT NULL,
  is_reserved BOOLEAN DEFAULT FALSE,
  reserved_by INTEGER REFERENCES users(id),
  reserved_at TIMESTAMP,
  UNIQUE(offer_id, slot_time)
);

-- Индексы для быстрого поиска доступных слотов
CREATE INDEX IF NOT EXISTS idx_offer_time_slots_offer_id ON offer_time_slots(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_time_slots_reserved ON offer_time_slots(offer_id, is_reserved);

COMMENT ON TABLE offer_time_slots IS 'Временные слоты для объявлений (каждые 15 минут)';
COMMENT ON COLUMN offer_time_slots.slot_time IS 'Время начала слота (например, 10:00, 10:15, 10:30)';
COMMENT ON COLUMN offer_time_slots.is_reserved IS 'Зарезервирован ли этот временной слот';