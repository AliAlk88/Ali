-- ALI BRAIN Telegram Bot - Supabase Schema
-- قم بتنفيذ هذا في SQL Editor في Supabase

-- جدول التحليلات
CREATE TABLE IF NOT EXISTS analyses (
    id BIGSERIAL PRIMARY KEY,
    signal VARCHAR(50) NOT NULL,
    price DECIMAL(20, 2),
    price_change DECIMAL(10, 4),
    confidence INTEGER,
    risk_level VARCHAR(20),
    risk_percent INTEGER,
    strategy VARCHAR(100),
    indicators JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل الأسعار
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20, 2),
    price_change_percent DECIMAL(10, 4),
    volume DECIMAL(30, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول إعدادات المستخدمين
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol);

-- Row Level Security (RLS) - اختياري
-- ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (للسماح بالقراءة والكتابة)
-- CREATE POLICY "Allow all access" ON analyses FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all access" ON price_history FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all access" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- تعليقات
COMMENT ON TABLE analyses IS 'تحليلات السوق والإشارات';
COMMENT ON TABLE price_history IS 'سجل أسعار العملات';
COMMENT ON TABLE user_settings IS 'إعدادات المستخدمين';
