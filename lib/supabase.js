/**
 * Supabase Client - للاتصال بقاعدة البيانات
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not set. Using in-memory storage.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * حفظ تحليل في قاعدة البيانات
 */
async function saveAnalysis(analysis) {
  if (!supabase) {
    console.log('📊 Analysis (not saved - no DB):', analysis.signal);
    return { success: true, stored: false };
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert([{
        signal: analysis.signal,
        price: analysis.price,
        price_change: analysis.priceChange,
        confidence: analysis.confidence,
        risk_level: analysis.risk?.level,
        risk_percent: analysis.risk?.percent,
        strategy: analysis.strategy,
        indicators: analysis.indicators,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return { success: true, stored: true, data };
  } catch (error) {
    console.error('Error saving analysis:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على آخر التحليلات
 */
async function getRecentAnalyses(limit = 10) {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching analyses:', error.message);
    return [];
  }
}

/**
 * حفظ سجل الأسعار
 */
async function savePriceHistory(priceData) {
  if (!supabase) return { success: true, stored: false };

  try {
    const { data, error } = await supabase
      .from('price_history')
      .insert([{
        symbol: priceData.symbol,
        price: priceData.price,
        price_change_percent: priceData.priceChangePercent,
        volume: priceData.volume,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return { success: true, stored: true };
  } catch (error) {
    console.error('Error saving price:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على سجل الأسعار
 */
async function getPriceHistory(limit = 20) {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('price_history')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching price history:', error.message);
    return [];
  }
}

/**
 * حفظ إعدادات المستخدم
 */
async function saveUserSettings(userId, settings) {
  if (!supabase) return { success: true, stored: false };

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert([{
        user_id: userId,
        settings: settings,
        updated_at: new Date().toISOString()
      }], { onConflict: 'user_id' });

    if (error) throw error;
    return { success: true, stored: true };
  } catch (error) {
    console.error('Error saving user settings:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * الحصول على إعدادات المستخدم
 */
async function getUserSettings(userId) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.settings || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  supabase,
  saveAnalysis,
  getRecentAnalyses,
  savePriceHistory,
  getPriceHistory,
  saveUserSettings,
  getUserSettings
};
