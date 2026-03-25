/**
 * Bot Handler - معالجة أوامر البوت الذكي
 * واجهة محسنة مع المنصات والفرص
 */

const config = require('../config');
const marketAnalysis = require('../services/marketAnalysis');
const priceService = require('../services/priceService');
const { saveAnalysis, getRecentAnalyses, saveUserSettings, getUserSettings } = require('./supabase');

/**
 * تنسيق رسالة التحليل الرئيسية
 */
function formatAnalysisMessage(analysis) {
    const { signal, signalEmoji, confidence, risk, strategy, strategyEmoji, price, priceChange, indicators, opportunities } = analysis;

    const changeStr = priceChange >= 0 ? `+${priceChange.toFixed(2)}%` : `${priceChange.toFixed(2)}%`;
    const changeEmoji = priceChange >= 0 ? '📈' : '📉';
    const location = config.locations[Math.floor(Math.random() * config.locations.length)];

    // بناء قائمة الفرص
    let opportunitiesText = '';
    if (opportunities && opportunities.length > 0) {
        opportunitiesText = '\n🎯 **أفضل الفرص:**\n';
        opportunities.slice(0, 3).forEach(opp => {
            opportunitiesText += `• ${opp.asset.logo} ${opp.asset.symbol}: ${opp.emoji} ${opp.signal}\n`;
        });
    }

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
${opportunitiesText}
━━━━━━━━━━━━━━━━━━━━━━

📡 Monitoring US/EU/ASIA Sessions 24/7
⏰ ${new Date().toLocaleTimeString()}
`;
}

/**
 * تنسيق رسالة الأسعار
 */
function formatPriceMessage(marketData) {
    const { crypto, stocks, indices } = marketData;

    let message = `💰 **Market Prices**\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `🪙 **Cryptocurrencies:**\n`;

    crypto.slice(0, 5).forEach(c => {
        const changeEmoji = c.priceChangePercent >= 0 ? '📈' : '📉';
        const changeStr = c.priceChangePercent >= 0 ? `+${c.priceChangePercent.toFixed(2)}%` : `${c.priceChangePercent.toFixed(2)}%`;
        message += `• ${c.logo} **${c.symbol}**: $${c.price < 10 ? c.price.toFixed(4) : c.price.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${changeEmoji} ${changeStr}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📈 **Stocks:**\n`;

    stocks.slice(0, 4).forEach(s => {
        const changeEmoji = s.priceChangePercent >= 0 ? '📈' : '📉';
        const changeStr = s.priceChangePercent >= 0 ? `+${s.priceChangePercent.toFixed(2)}%` : `${s.priceChangePercent.toFixed(2)}%`;
        message += `• ${s.logo} **${s.symbol}**: $${s.price.toFixed(2)} ${changeEmoji} ${changeStr}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📊 **Indices:**\n`;

    indices.forEach(i => {
        const changeEmoji = i.priceChangePercent >= 0 ? '📈' : '📉';
        const changeStr = i.priceChangePercent >= 0 ? `+${i.priceChangePercent.toFixed(2)}%` : `${i.priceChangePercent.toFixed(2)}%`;
        message += `• ${i.logo} **${i.name}**: ${i.price.toFixed(0)} ${changeEmoji} ${changeStr}\n`;
    });

    message += `\n⏰ ${new Date().toLocaleTimeString()}`;

    return message;
}

/**
 * تنسيق رسالة الإشارة السريعة
 */
function formatQuickSignal(analysis) {
    const { signal, signalEmoji, confidence, price, opportunities } = analysis;

    let message = `
${signalEmoji} **${signal}**

━━━━━━━━━━━━━━━━━━━━━━

💰 BTC: $${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
🎯 Confidence: ${confidence}%

━━━━━━━━━━━━━━━━━━━━━━
`;

    if (opportunities && opportunities.length > 0) {
        message += `\n🔥 **Top Opportunities:**\n`;
        opportunities.slice(0, 3).forEach(opp => {
            message += `${opp.emoji} ${opp.asset.logo} ${opp.asset.symbol}: ${opp.signal}\n`;
        });
    }

    message += `\n⏰ ${new Date().toLocaleTimeString()}`;

    return message;
}

/**
 * تنسيق رسالة المنصات الموصى بها
 */
function formatPlatformsMessage() {
    const platforms = config.platforms;

    let message = `🏦 **منصات التداول الموصى بها**\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Crypto Platforms
    message += `🪙 **Cryptocurrency Platforms:**\n`;
    platforms.crypto.filter(p => p.recommended).forEach(p => {
        message += `\n${p.logo} **${p.name}**\n`;
        message += `   ${p.features.join(' • ')}\n`;
        message += `   🔗 ${p.url}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Stock Platforms
    message += `📈 **Stock Trading Platforms:**\n`;
    platforms.stocks.filter(p => p.recommended).forEach(p => {
        message += `\n${p.logo} **${p.name}**\n`;
        message += `   ${p.features.join(' • ')}\n`;
        message += `   🔗 ${p.url}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Forex Platforms
    message += `💱 **Forex Platforms:**\n`;
    platforms.forex.filter(p => p.recommended).forEach(p => {
        message += `\n${p.logo} **${p.name}**\n`;
        message += `   ${p.features.join(' • ')}\n`;
        message += `   🔗 ${p.url}\n`;
    });

    message += `\n⏰ ${new Date().toLocaleTimeString()}`;

    return message;
}

/**
 * تنسيق رسالة فرص التداول
 */
function formatOpportunitiesMessage(opportunities) {
    if (!opportunities || opportunities.length === 0) {
        return `
📊 **فرص التداول**

━━━━━━━━━━━━━━━━━━━━━━

⏸️ لا توجد فرص واضحة حالياً
المراقبة مستمرة...

⏰ ${new Date().toLocaleTimeString()}
`;
    }

    let message = `📊 **أفضل فرص التداول الآن**\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // فرص الشراء
    const buyOpps = opportunities.filter(o => o.signal.includes('BUY'));
    if (buyOpps.length > 0) {
        message += `🟢 **فرص الشراء:**\n`;
        buyOpps.slice(0, 3).forEach(opp => {
            const asset = opp.asset;
            message += `\n${opp.emoji} **${asset.logo} ${asset.symbol}** - ${asset.name}\n`;
            message += `   💰 السعر: $${asset.price < 10 ? asset.price.toFixed(4) : asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}\n`;
            message += `   📉 التغير: ${asset.priceChangePercent.toFixed(2)}%\n`;
            message += `   🎯 الثقة: ${opp.confidence}%\n`;
            if (opp.reasons && opp.reasons.length > 0) {
                message += `   📝 ${opp.reasons[0]}\n`;
            }
        });
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // فرص البيع
    const sellOpps = opportunities.filter(o => o.signal.includes('SELL'));
    if (sellOpps.length > 0) {
        message += `🔴 **فرص البيع:**\n`;
        sellOpps.slice(0, 3).forEach(opp => {
            const asset = opp.asset;
            message += `\n${opp.emoji} **${asset.logo} ${asset.symbol}** - ${asset.name}\n`;
            message += `   💰 السعر: $${asset.price < 10 ? asset.price.toFixed(4) : asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}\n`;
            message += `   📈 التغير: +${Math.abs(asset.priceChangePercent).toFixed(2)}%\n`;
            message += `   🎯 الثقة: ${opp.confidence}%\n`;
        });
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // المنصات الموصى بها للتداول
    message += `🏦 **التداول على:**\n`;
    const recommended = priceService.getRecommendedPlatforms();
    message += `• 🪙 Crypto: ${recommended.crypto.map(p => p.logo + ' ' + p.name).join(', ')}\n`;
    message += `• 📈 Stocks: ${recommended.stocks.map(p => p.logo + ' ' + p.name).join(', ')}\n`;

    message += `\n⏰ ${new Date().toLocaleTimeString()}`;

    return message;
}

/**
 * تنسيق قائمة المراقبة
 */
function formatWatchlistMessage() {
    const assets = config.assets;

    let message = `👁️ **قائمة المراقبة الذكية**\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    message += `🪙 **Cryptocurrencies:**\n`;
    assets.crypto.forEach(a => {
        message += `${a.logo} **${a.symbol}** - ${a.name}\n`;
    });

    message += `\n📈 **Stocks:**\n`;
    assets.stocks.forEach(a => {
        message += `${a.logo} **${a.symbol}** - ${a.name}\n`;
    });

    message += `\n📊 **Indices:**\n`;
    assets.indices.forEach(a => {
        message += `${a.logo} **${a.symbol}** - ${a.name}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `💡 استخدم /price لأسعار حقيقية\n`;
    message += `💡 استخدم /opportunities للفرص\n`;

    message += `\n⏰ ${new Date().toLocaleTimeString()}`;

    return message;
}

/**
 * معالجة الأوامر
 */
async function handleCommand(command, userId) {
    switch (command) {
        case 'start':
            return {
                text: config.messages.welcome,
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
                    text: '❌ حدث خطأ أثناء التحليل.',
                    parse_mode: 'Markdown'
                };
            }

        case 'price':
            try {
                const marketData = await priceService.getAllMarketPrices();
                return {
                    text: formatPriceMessage(marketData),
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

        case 'platforms':
            return {
                text: formatPlatformsMessage(),
                parse_mode: 'Markdown'
            };

        case 'opportunities':
            try {
                const opportunities = await priceService.findTradingOpportunities();
                return {
                    text: formatOpportunitiesMessage(opportunities),
                    parse_mode: 'Markdown'
                };
            } catch (error) {
                return {
                    text: '❌ حدث خطأ أثناء البحث عن الفرص.',
                    parse_mode: 'Markdown'
                };
            }

        case 'watchlist':
            return {
                text: formatWatchlistMessage(),
                parse_mode: 'Markdown'
            };

        case 'status':
            const lastAnalysis = marketAnalysis.getLastAnalysis();
            const recentAnalyses = await getRecentAnalyses(5);

            return {
                text: `
📊 **System Status**

━━━━━━━━━━━━━━━━━━━━━━

🤖 Bot: 🟢 Running (Vercel Serverless)
💾 Database: ${process.env.SUPABASE_URL ? '🟢 Supabase Connected' : '🟡 Not Configured'}
📦 Version: ${config.botInfo.version}

━━━━━━━━━━━━━━━━━━━━━━

📈 **Last Signal:** ${lastAnalysis?.signal || 'N/A'}
🎯 **Confidence:** ${lastAnalysis?.confidence || 0}%
⚠️ **Risk:** ${lastAnalysis?.risk?.level || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━

💾 Price History: ${Object.keys(priceService.priceHistory).length} assets
📊 Analysis History: ${recentAnalyses.length} records

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
        return { text: 'استخدم /analyze للحصول على تحليل كامل', parse_mode: 'Markdown' };
    } else if (lowerText.includes('سعر') || lowerText.includes('price')) {
        return { text: 'استخدم /price للحصول على الأسعار', parse_mode: 'Markdown' };
    } else if (lowerText.includes('إشارة') || lowerText.includes('signal')) {
        return { text: 'استخدم /signal للحصول على إشارة سريعة', parse_mode: 'Markdown' };
    } else if (lowerText.includes('منصة') || lowerText.includes('platform')) {
        return { text: 'استخدم /platforms لعرض المنصات الموصى بها', parse_mode: 'Markdown' };
    } else if (lowerText.includes('فرص') || lowerText.includes('opportunity')) {
        return { text: 'استخدم /opportunities لعرض أفضل فرص التداول', parse_mode: 'Markdown' };
    }

    return { text: '👋 أرسل /help لمعرفة الأوامر المتاحة', parse_mode: 'Markdown' };
}

module.exports = {
    handleCommand,
    handleMessage,
    formatAnalysisMessage,
    formatPriceMessage,
    formatQuickSignal,
    formatPlatformsMessage,
    formatOpportunitiesMessage,
    formatWatchlistMessage
};
