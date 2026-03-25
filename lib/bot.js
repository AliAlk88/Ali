/**
 * Bot Handler - معالجة أوامر البوت
 * يعمل مع Webhook لـ Vercel
 */

const config = require('../config');
const marketAnalysis = require('../services/marketAnalysis');
const priceService = require('../services/priceService');
const { saveAnalysis, getRecentAnalyses, saveUserSettings, getUserSettings } = require('./supabase');

/**
 * تنسيق رسالة التحليل
 */
function formatAnalysisMessage(analysis) {
  const { signal, signalEmoji, confidence, risk, strategy, strategyEmoji, price, priceChange, indicators } = analysis;

  const changeStr = priceChange >= 0 ? `+${priceChange.toFixed(2)}%` : `${priceChange.toFixed(2)}%`;
  const changeEmoji = priceChange >= 0 ? '📈' : '📉';

  const location = config.locations[Math.floor(Math.random() * config.locations.length)];

  return `
${signalEmoji} **${signal}** ${signalEmoji}

━━━━━━━━━━━━━━━━━━━━━━

📍 **Location:** ${location.flag} ${location.name}

💰 **BTC Price:** $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${changeEmoji} **24h Change:** ${changeStr}

━━━━━━━━━━━━━━━━━━━━━━

📊 **Technical Analysis:**
• RSI: ${indicators?.rsi || 'N/A'}
• Momentum: ${indicators?.momentum || 'N/A'}
• Trend: ${indicators?.trend?.direction || 'N/A'}
• Volatility: ${indicators?.volatility || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━

🎯 **Signal Confidence:** ${confidence}%
⚠️ **Risk Level:** ${risk?.level || 'N/A'} (${risk?.percent || 0}%)
${strategyEmoji} **Strategy:** ${strategy}

━━━━━━━━━━━━━━━━━━━━━━

📡 Monitoring US/EU/ASIA Sessions 24/7
⏰ ${new Date().toLocaleTimeString()}
`;
}

/**
 * تنسيق رسالة السعر
 */
function formatPriceMessage(btc, sp500) {
  const changeEmoji = btc.priceChangePercent >= 0 ? '📈' : '📉';
  const changeStr = btc.priceChangePercent >= 0
    ? `+${btc.priceChangePercent.toFixed(2)}%`
    : `${btc.priceChangePercent.toFixed(2)}%`;

  return `
💰 **Market Prices**

━━━━━━━━━━━━━━━━━━━━━━

🪙 **Bitcoin (BTC)**
• Price: $${btc.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• 24h Change: ${changeEmoji} ${changeStr}
• 24h High: $${(btc.highPrice || btc.price * 1.01).toLocaleString('en-US', { minimumFractionDigits: 2 })}
• 24h Low: $${(btc.lowPrice || btc.price * 0.99).toLocaleString('en-US', { minimumFractionDigits: 2 })}

━━━━━━━━━━━━━━━━━━━━━━

📊 **S&P 500**
• Price: $${sp500.price.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleTimeString()}
`;
}

/**
 * تنسيق رسالة الإشارة السريعة
 */
function formatQuickSignal(analysis) {
  const { signal, signalEmoji, confidence, price } = analysis;

  return `
${signalEmoji} **${signal}**

━━━━━━━━━━━━━━━━━━━━━━

💰 BTC: $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
🎯 Confidence: ${confidence}%

━━━━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleTimeString()}
`;
}

/**
 * معالجة الأوامر
 */
async function handleCommand(command, userId) {
  switch (command) {
    case 'start':
      return {
        text: `
🤖 **Welcome to ALI BRAIN CLOUD SYNC**

مرحباً! أنا بوت التحليل المالي الذكي.

━━━━━━━━━━━━━━━━━━━━━━

📋 **Available Commands:**

/analyze - تحليل السوق الكامل
/price - أسعار العملات الحالية
/signal - إشارة التداول السريعة
/status - حالة النظام
/help - المساعدة

━━━━━━━━━━━━━━━━━━━━━━

⚠️ **Disclaimer:** This is for educational purposes only. Not financial advice.
`,
        parse_mode: 'Markdown'
      };

    case 'help':
      return {
        text: config.messages.help,
        parse_mode: 'Markdown'
      };

    case 'analyze':
      try {
        const analysis = await marketAnalysis.analyze();
        await saveAnalysis(analysis);
        return {
          text: formatAnalysisMessage(analysis),
          parse_mode: 'Markdown'
        };
      } catch (error) {
        return {
          text: '❌ حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.',
          parse_mode: 'Markdown'
        };
      }

    case 'price':
      try {
        const btc = await priceService.getBtcPrice();
        const sp500 = await priceService.getSp500Price();
        return {
          text: formatPriceMessage(btc, sp500),
          parse_mode: 'Markdown'
        };
      } catch (error) {
        return {
          text: '❌ حدث خطأ أثناء جلب الأسعار.',
          parse_mode: 'Markdown'
        };
      }

    case 'signal':
      try {
        const analysis = await marketAnalysis.analyze();
        return {
          text: formatQuickSignal(analysis),
          parse_mode: 'Markdown'
        };
      } catch (error) {
        return {
          text: '❌ حدث خطأ.',
          parse_mode: 'Markdown'
        };
      }

    case 'status':
      const lastAnalysis = marketAnalysis.getLastAnalysis();
      const recentAnalyses = await getRecentAnalyses(5);

      return {
        text: `
📊 **System Status**

━━━━━━━━━━━━━━━━━━━━━━

🤖 Bot: 🟢 Running (Vercel Serverless)
💾 Database: ${process.env.SUPABASE_URL ? '🟢 Supabase Connected' : '🟡 Not Configured'}

━━━━━━━━━━━━━━━━━━━━━━

📈 **Last Signal:** ${lastAnalysis?.signal || 'N/A'}
🎯 **Confidence:** ${lastAnalysis?.confidence || 0}%
⚠️ **Risk:** ${lastAnalysis?.risk?.level || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━

💾 Price History: ${priceService.priceHistory.length} records
📊 Analysis History: ${recentAnalyses.length} records (DB)

⏰ ${new Date().toLocaleTimeString()}
`,
        parse_mode: 'Markdown'
      };

    default:
      return {
        text: '❓ أمر غير معروف. استخدم /help للمساعدة.',
        parse_mode: 'Markdown'
      };
  }
}

/**
 * معالجة رسائل المستخدم
 */
async function handleMessage(text, userId) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('تحليل') || lowerText.includes('analysis')) {
    return {
      text: 'استخدم /analyze للحصول على تحليل كامل',
      parse_mode: 'Markdown'
    };
  } else if (lowerText.includes('سعر') || lowerText.includes('price')) {
    return {
      text: 'استخدم /price للحصول على الأسعار',
      parse_mode: 'Markdown'
    };
  } else if (lowerText.includes('إشارة') || lowerText.includes('signal')) {
    return {
      text: 'استخدم /signal للحصول على إشارة سريعة',
      parse_mode: 'Markdown'
    };
  }

  return {
    text: '👋 أرسل /help لمعرفة الأوامر المتاحة',
    parse_mode: 'Markdown'
  };
}

module.exports = {
  handleCommand,
  handleMessage,
  formatAnalysisMessage,
  formatPriceMessage,
  formatQuickSignal
};
