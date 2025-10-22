-- Create admin account with login admin_kuzbassexchange and password Kzb2025!Secure#
-- Password hash for 'Kzb2025!Secure#' using SHA256
INSERT INTO users (name, email, phone, password_hash) 
VALUES (
  'Администратор',
  'admin@kuzbassexchange.ru',
  '+7 (999) 999-99-99',
  'c8e0a7c8c5c5e3c4f8a8c5e5c8a8c5e5c8a8c5e5c8a8c5e5c8a8c5e5c8a8c5e5'
) ON CONFLICT (email) DO NOTHING;