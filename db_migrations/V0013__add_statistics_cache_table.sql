-- Таблица для кэширования статистики
CREATE TABLE IF NOT EXISTS t_p53513159_legal_crypto_exchang.statistics_cache (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p53513159_legal_crypto_exchang.users(id),
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Статистика
    total_deals INTEGER DEFAULT 0,
    completed_deals INTEGER DEFAULT 0,
    total_volume NUMERIC(15,2) DEFAULT 0,
    buy_deals INTEGER DEFAULT 0,
    buy_volume NUMERIC(15,2) DEFAULT 0,
    sell_deals INTEGER DEFAULT 0,
    sell_volume NUMERIC(15,2) DEFAULT 0,
    active_offers INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, period_type, period_start, period_end)
);

-- Таблица для глобальной статистики (для админа)
CREATE TABLE IF NOT EXISTS t_p53513159_legal_crypto_exchang.global_statistics_cache (
    id SERIAL PRIMARY KEY,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Глобальная статистика
    total_users INTEGER DEFAULT 0,
    blocked_users INTEGER DEFAULT 0,
    total_offers INTEGER DEFAULT 0,
    active_offers INTEGER DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    completed_deals INTEGER DEFAULT 0,
    total_volume NUMERIC(15,2) DEFAULT 0,
    buy_deals INTEGER DEFAULT 0,
    buy_volume NUMERIC(15,2) DEFAULT 0,
    sell_deals INTEGER DEFAULT 0,
    sell_volume NUMERIC(15,2) DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(period_type, period_start, period_end)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_stats_cache_user_period ON t_p53513159_legal_crypto_exchang.statistics_cache(user_id, period_type);
CREATE INDEX IF NOT EXISTS idx_global_stats_period ON t_p53513159_legal_crypto_exchang.global_statistics_cache(period_type);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON t_p53513159_legal_crypto_exchang.deals(created_at);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON t_p53513159_legal_crypto_exchang.offers(created_at);