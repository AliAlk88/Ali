/**
 * Analyze API - تحليل السوق عبر API
 * يمكن استدعاؤه من UptimeRobot أو أي خدمة أخرى
 */

const marketAnalysis = require('../services/marketAnalysis');
const priceService = require('../services/priceService');
const { saveAnalysis, savePriceHistory } = require('../lib/supabase');

/**
 * Vercel Serverless Function Handler
 */
module.exports = async function handler(req, res) {
  // السماح بـ GET و POST
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // جلب بيانات السوق
    const btc = await priceService.getCryptoPrice('BTC');
    const sp500 = await priceService.getIndexPrice('SPX');

    // تحليل السوق
    const analysis = await marketAnalysis.analyze();

    // حفظ في قاعدة البيانات
    await saveAnalysis(analysis);
    await savePriceHistory(btc);

    // إرجاع النتيجة
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        signal: analysis.signal,
        confidence: analysis.confidence,
        risk: analysis.risk,
        price: analysis.price,
        priceChange: analysis.priceChange,
        strategy: analysis.strategy,
        indicators: analysis.indicators
      }
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
