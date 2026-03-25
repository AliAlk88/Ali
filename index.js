/**
 * ALI BRAIN CLOUD SYNC - Telegram Trading Bot
 * بوت تداول التلغرام مع تحليل ذكي
 *
 * ✅ تم إصلاح مشكلة HOLD - الآن الإشارات ديناميكية
 *
 * @author Ali Alkhafajy
 * @version 2.0.0
 */

require('dotenv').config();
const { Telegraf } = require('telegraf');
const config = require('./config');
const marketAnalysis = require('./services/marketAnalysis');
const priceService = require('./services/priceService');

// إنشاء البوت
const botToken = process.env.BOT_TOKEN || config.telegram.botToken;

if (!botToken || botToken === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Error: BOT_TOKEN not set!');
    console.error('Please set BOT_TOKEN in environment or config.js');
    process.exit(1);
}

const bot = new Telegraf(botToken);

// متغيرات النظام
let isRunning = false;
let lastSignalTime = null;
let signalInterval = null;

/**
 * تنسيق رسالة التحليل
 */
function formatAnalysisMessage(analysis) {
    const { signal, signalEmoji, confidence, risk, strategy, strategyEmoji, price, priceChange, indicators } = analysis;

    // تحديد لون الإشارة
    let signalColor = '⚪️';
    if (signal.includes('BUY')) signalColor = '🟢';
    else if (signal.includes('SELL')) signalColor = '🔴';

    // تنسيق التغير
    const changeStr = priceChange >= 0 ? `+${priceChange.toFixed(2)}%` : `${priceChange.toFixed(2)}%`;
    const changeEmoji = priceChange >= 0 ? '📈' : '📉';

    // تحديد الموقع الحالي
    const location = config.locations[Math.floor(Math.random() * config.locations.length)];

    const message = `
${signalEmoji} **${signal}** ${signalEmoji}

━━━━━━━━━━━━━━━━━━━━━━

📍 **Location:** ${location.flag} ${location.name}

💰 **BTC Price:** $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${changeEmoji} **24h Change:** ${changeStr}

━━━━━━━━━━━━━━━━━━━━━━

📊 **Technical Analysis:**
• RSI: ${indicators.rsi || 'N/A'}
• Momentum: ${indicators.momentum || 'N/A'}
• Trend: ${indicators.trend?.direction || 'N/A'}
• Volatility: ${indicators.volatility || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━

🎯 **Signal Confidence:** ${confidence}%
⚠️ **Risk Level:** ${risk.level} (${risk.percent}%)
${strategyEmoji} **Strategy:** ${strategy}

━━━━━━━━━━━━━━━━━━━━━━

📡 Monitoring US/EU/ASIA Sessions 24/7
⏰ ${new Date().toLocaleTimeString()}
`;

    return message;
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

// ========== أوامر البوت ==========

// أمر البدء
bot.command('start', (ctx) => {
    const welcomeMessage = `
🤖 **Welcome to ALI BRAIN CLOUD SYNC**

مرحباً! أنا بوت التحليل المالي الذكي.

━━━━━━━━━━━━━━━━━━━━━━

📋 **Available Commands:**

/analyze - تحليل السوق الكامل
/price - أسعار العملات الحالية
/signal - إشارة التداول السريعة
/auto - تشغيل الإشارات التلقائية
/stop - إيقاف الإشارات التلقائية
/status - حالة النظام
/help - المساعدة

━━━━━━━━━━━━━━━━━━━━━━

⚠️ **Disclaimer:** This is for educational purposes only. Not financial advice.
`;
    ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

// أمر المساعدة
bot.command('help', (ctx) => {
    ctx.reply(config.messages.help, { parse_mode: 'Markdown' });
});

// أمر التحليل الكامل
bot.command('analyze', async (ctx) => {
    try {
        await ctx.reply('🔄 جاري التحليل...');

        const analysis = await marketAnalysis.analyze();
        const message = formatAnalysisMessage(analysis);

        await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error in /analyze:', error.message);
        await ctx.reply('❌ حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.');
    }
});

// أمر السعر
bot.command('price', async (ctx) => {
    try {
        await ctx.reply('🔄 جاري جلب الأسعار...');

        const btc = await priceService.getBtcPrice();
        const sp500 = await priceService.getSp500Price();
        const message = formatPriceMessage(btc, sp500);

        await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error in /price:', error.message);
        await ctx.reply('❌ حدث خطأ أثناء جلب الأسعار.');
    }
});

// أمر الإشارة السريعة
bot.command('signal', async (ctx) => {
    try {
        const analysis = await marketAnalysis.analyze();
        const message = formatQuickSignal(analysis);

        await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error in /signal:', error.message);
        await ctx.reply('❌ حدث خطأ.');
    }
});

// أمر تشغيل الإشارات التلقائية
bot.command('auto', async (ctx) => {
    if (isRunning) {
        await ctx.reply('⚠️ الإشارات التلقائية تعمل بالفعل!');
        return;
    }

    isRunning = true;
    await ctx.reply('✅ تم تشغيل الإشارات التلقائية (كل 5 دقائق)');

    // إرسال تحليل فوري
    const analysis = await marketAnalysis.analyze();
    await ctx.reply(formatAnalysisMessage(analysis), { parse_mode: 'Markdown' });

    // تشغيل التحليل الدوري
    signalInterval = setInterval(async () => {
        try {
            const newAnalysis = await marketAnalysis.analyze();

            // إرسال فقط إذا تغيرت الإشارة أو كل 15 دقيقة
            const timeSinceLastSignal = lastSignalTime ? Date.now() - lastSignalTime : Infinity;

            if (newAnalysis.signal !== marketAnalysis.lastSignal || timeSinceLastSignal > 15 * 60 * 1000) {
                await ctx.reply(formatAnalysisMessage(newAnalysis), { parse_mode: 'Markdown' });
                lastSignalTime = Date.now();
            }

        } catch (error) {
            console.error('Error in auto signal:', error.message);
        }
    }, 5 * 60 * 1000); // كل 5 دقائق
});

// أمر إيقاف الإشارات التلقائية
bot.command('stop', async (ctx) => {
    if (!isRunning) {
        await ctx.reply('⚠️ الإشارات التلقائية متوقفة بالفعل!');
        return;
    }

    isRunning = false;
    if (signalInterval) {
        clearInterval(signalInterval);
        signalInterval = null;
    }

    await ctx.reply('🛑 تم إيقاف الإشارات التلقائية.');
});

// أمر حالة النظام
bot.command('status', async (ctx) => {
    const lastAnalysis = marketAnalysis.getLastAnalysis();

    const statusMessage = `
📊 **System Status**

━━━━━━━━━━━━━━━━━━━━━━

🤖 Bot: ${isRunning ? '🟢 Running' : '🔴 Stopped'}
📡 Auto Signals: ${isRunning ? '✅ Active' : '❌ Inactive'}

━━━━━━━━━━━━━━━━━━━━━━

📈 **Last Signal:** ${lastAnalysis.signal || 'N/A'}
🎯 **Confidence:** ${lastAnalysis.confidence || 0}%
⚠️ **Risk:** ${lastAnalysis.risk?.level || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━

💾 Price History: ${priceService.priceHistory.length} records
📊 Analysis History: ${marketAnalysis.analysisHistory.length} records

⏰ ${new Date().toLocaleTimeString()}
`;
    await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
});

// ========== معالجة الرسائل ==========

bot.on('text', async (ctx) => {
    const text = ctx.message.text.toLowerCase();

    // ردود على كلمات مفتاحية
    if (text.includes('تحليل') || text.includes('analysis')) {
        ctx.reply('استخدم /analyze للحصول على تحليل كامل');
    } else if (text.includes('سعر') || text.includes('price')) {
        ctx.reply('استخدم /price للحصول على الأسعار');
    } else if (text.includes('إشارة') || text.includes('signal')) {
        ctx.reply('استخدم /signal للحصول على إشارة سريعة');
    }
});

// ========== معالجة الأخطاء ==========

bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
});

// ========== تشغيل البوت ==========

async function startBot() {
    try {
        console.log('🤖 ALI BRAIN CLOUD SYNC Bot v2.0.0');
        console.log('🚀 Starting bot...');

        // تشغيل البوت
        await bot.launch();
        console.log('✅ Bot started successfully!');
        console.log('📱 Send /start to begin');

        // تحديث الأسعار في الخلفية
        setInterval(async () => {
            try {
                await priceService.getBtcPrice();
            } catch (error) {
                console.error('Error updating prices:', error.message);
            }
        }, 30 * 1000); // كل 30 ثانية

    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        process.exit(1);
    }
}

// إيقاف البوت عند إغلاق البرنامج
process.once('SIGINT', () => {
    console.log('🛑 Shutting down...');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.log('🛑 Shutting down...');
    bot.stop('SIGTERM');
});

// تشغيل البوت
startBot();
