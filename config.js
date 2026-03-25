/**
 * Configuration file for ALI BRAIN Trading Bot
 * تحديد جميع الإعدادات والمتغيرات الأساسية
 */

module.exports = {
    // Telegram Bot Configuration
    telegram: {
        // ضع توكن البوت الخاص بك هنا
        botToken: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
    },

    // API Configuration
    apis: {
        // Binance API for crypto prices
        binance: {
            baseUrl: 'https://api.binance.com/api/v3',
            endpoints: {
                btcPrice: '/ticker/price?symbol=BTCUSDT',
                btc24h: '/ticker/24hr?symbol=BTCUSDT',
                ethPrice: '/ticker/price?symbol=ETHUSDT',
            }
        },
        // Alternative free APIs
        coinGecko: {
            baseUrl: 'https://api.coingecko.com/api/v3',
            endpoints: {
                bitcoin: '/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
                ethereum: '/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
            }
        }
    },

    // Trading Analysis Settings
    analysis: {
        // عتبات التحليل (Thresholds)
        strongBuy: -3,      // تغير أقل من -3% = شراء قوي
        buy: -1.5,          // تغير بين -3% و -1.5% = شراء
        hold: {             // منطقة HOLD
            min: -1.5,
            max: 1.5
        },
        sell: 1.5,          // تغير بين 1.5% و 3% = بيع
        strongSell: 3,      // تغير أكثر من 3% = بيع قوي

        // RSI-like calculation settings
        rsi: {
            period: 14,
            oversold: 30,   // أقل من 30 = تشبع بيعي = فرصة شراء
            overbought: 70  // أعلى من 70 = تشبع شرائي = فرصة بيع
        },

        // Risk calculation
        riskLevels: {
            low: 25,
            medium: 50,
            high: 75
        }
    },

    // Locations for display
    locations: [
        { name: 'TOKYO', flag: '🇯🇵', timezone: 'Asia/Tokyo' },
        { name: 'LONDON', flag: '🇬🇧', timezone: 'Europe/London' },
        { name: 'NEW YORK', flag: '🇺🇸', timezone: 'America/New_York' },
        { name: 'DUBAI', flag: '🇦🇪', timezone: 'Asia/Dubai' },
        { name: 'SINGAPORE', flag: '🇸🇬', timezone: 'Asia/Singapore' },
    ],

    // Bot messages
    messages: {
        welcome: '🤖 مرحباً! أنا ALI BRAIN CLOUD SYNC Bot\n\nأنا هنا لتقديم تحليلات السوق والإشارات التداولية.',
        help: '📊 الأوامر المتاحة:\n\n/analyze - تحليل السوق الحالي\n/price - سعر Bitcoin الحالي\n/signal - إشارة التداول\n/status - حالة النظام',
    },

    // Bot info
    botInfo: {
        name: 'ALI BRAIN CLOUD SYNC',
        version: '2.0.0',
        author: 'Ali Alkhafajy'
    }
};
