-- Добавляем поле amount в резервации для сохранения суммы которую указал откликнувшийся
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS amount DECIMAL(18, 2);

COMMENT ON COLUMN reservations.amount IS 'Сумма USDT которую указал откликнувшийся при бронировании';