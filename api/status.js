/**
 * Status API - حالة النظام
 */

const marketAnalysis = require('../services/marketAnalysis');
const priceService = require('../services/priceService');
const { getRecentAnalyses, getPriceHistory } = require('../lib/supabase');

/**
 * Vercel Serverless Function Handler
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const lastAnalysis = marketAnalysis.getLastAnalysis();
    const recentAnalyses = await getRecentAnalyses(10);
    const priceHistory = await getPriceHistory(20);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        status: 'running',
        platform: 'Vercel Serverless',
        database: process.env.SUPABASE_URL ? 'connected' : 'not_configured'
      },
      lastAnalysis: lastAnalysis ? {
        signal: lastAnalysis.signal,
        confidence: lastAnalysis.confidence,
        price: lastAnalysis.price,
        timestamp: lastAnalysis.timestamp
      } : null,
      stats: {
        priceHistoryCount: Object.keys(priceService.priceHistory).length,
        analysisHistoryCount: marketAnalysis.analysisHistory.length,
        dbAnalysisCount: recentAnalyses.length,
        dbPriceHistoryCount: priceHistory.length
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
