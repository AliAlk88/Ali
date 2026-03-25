/**
 * Configuration file for ALI BRAIN Trading Bot
 * تحديد جميع الإعدادات والمتغيرات الأساسية
 */

module.exports = {
    // Telegram Bot Configuration
    telegram: {
        botToken: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
    },

    // APIs Configuration
    apis: {
        // Binance API
        binance: {
            baseUrl: 'https://api.binance.com/api/v3',
            endpoints: {
                btcPrice: '/ticker/price?symbol=BTCUSDT',
                btc24h: '/ticker/24hr?symbol=BTCUSDT',
                ethPrice: '/ticker/price?symbol=ETHUSDT',
                bnbPrice: '/ticker/price?symbol=BNBUSDT',
                solPrice: '/ticker/price?symbol=SOLUSDT',
                xrpPrice: '/ticker/price?symbol=XRPUSDT',
                adaPrice: '/ticker/price?symbol=ADAUSDT',
                dogePrice: '/ticker/price?symbol=DOGEUSDT',
            }
        },
        // CoinGecko API
        coinGecko: {
            baseUrl: 'https://api.coingecko.com/api/v3',
        },
        // Alpha Vantage for Stocks (Free API)
        alphaVantage: {
            baseUrl: 'https://www.alphavantage.co/query',
            apiKey: process.env.ALPHA_VANTAGE_KEY || 'demo',
        }
    },

    // 🏦 Supported Trading Platforms
    platforms: {
        crypto: [
            {
                name: 'Binance',
                logo: '🟡',
                url: 'https://www.binance.com',
                features: ['أكبر منصة تداول', 'رسوم منخفضة', 'PKR/USD مدعوم'],
                recommended: true,
                type: 'crypto'
            },
            {
                name: 'Coinbase',
                logo: '🔵',
                url: 'https://www.coinbase.com',
                features: ['سهلة للمبتدئين', 'آمنة جداً', 'بطاقات مدعومة'],
                recommended: true,
                type: 'crypto'
            },
            {
                name: 'Kraken',
                logo: '🟣',
                url: 'https://www.kraken.com',
                features: ['أمان عالي', 'Futures متاحة', 'Euro مدعوم'],
                recommended: false,
                type: 'crypto'
            },
            {
                name: 'Bybit',
                logo: '🟠',
                url: 'https://www.bybit.com',
                features: ['Derivatives', 'Copy Trading', ' bonuses'],
                recommended: true,
                type: 'crypto'
            },
            {
                name: 'KuCoin',
                logo: '🟢',
                url: 'https://www.kucoin.com',
                features: ['Altcoins كثيرة', 'مكافآت', 'تداول آلي'],
                recommended: false,
                type: 'crypto'
            }
        ],
        stocks: [
            {
                name: 'eToro',
                logo: '📗',
                url: 'https://www.etoro.com',
                features: ['Copy Trading', 'اسهم + كريبتو', 'سهل الاستخدام'],
                recommended: true,
                type: 'stocks'
            },
            {
                name: 'Interactive Brokers',
                logo: '📘',
                url: 'https://www.interactivebrokers.com',
                features: ['احترافي', 'كل الأسواق', 'عمولات منخفضة'],
                recommended: true,
                type: 'stocks'
            },
            {
                name: 'TD Ameritrade',
                logo: '📙',
                url: 'https://www.tdameritrade.com',
                features: ['مجاني للأسهم', 'بحث متقدم', 'تعليم'],
                recommended: false,
                type: 'stocks'
            },
            {
                name: 'Robinhood',
                logo: '📕',
                url: 'https://www.robinhood.com',
                features: ['بدون عمولات', 'سهل', 'Crypto متاح'],
                recommended: false,
                type: 'stocks'
            }
        ],
        forex: [
            {
                name: 'OANDA',
                logo: '🔶',
                url: 'https://www.oanda.com',
                features: ['فوركس محترف', 'تحليل متقدم', 'تنظيم قوي'],
                recommended: true,
                type: 'forex'
            },
            {
                name: 'IG',
                logo: '🔷',
                url: 'https://www.ig.com',
                features: ['CFD', 'منصة متقدمة', 'تعليم'],
                recommended: true,
                type: 'forex'
            }
        ]
    },

    // 📊 Supported Assets to Trade
    assets: {
        crypto: [
            { symbol: 'BTC', name: 'Bitcoin', logo: '₿', priority: 1 },
            { symbol: 'ETH', name: 'Ethereum', logo: 'Ξ', priority: 1 },
            { symbol: 'BNB', name: 'BNB', logo: '🔶', priority: 2 },
            { symbol: 'SOL', name: 'Solana', logo: '◎', priority: 2 },
            { symbol: 'XRP', name: 'Ripple', logo: '✕', priority: 2 },
            { symbol: 'ADA', name: 'Cardano', logo: '₳', priority: 3 },
            { symbol: 'DOGE', name: 'Dogecoin', logo: 'Ð', priority: 3 },
            { symbol: 'DOT', name: 'Polkadot', logo: '●', priority: 3 },
        ],
        stocks: [
            { symbol: 'AAPL', name: 'Apple', logo: '🍎', priority: 1 },
            { symbol: 'TSLA', name: 'Tesla', logo: '🚗', priority: 1 },
            { symbol: 'NVDA', name: 'NVIDIA', logo: '💚', priority: 1 },
            { symbol: 'MSFT', name: 'Microsoft', logo: '💻', priority: 1 },
            { symbol: 'GOOGL', name: 'Google', logo: '🔍', priority: 2 },
            { symbol: 'AMZN', name: 'Amazon', logo: '📦', priority: 2 },
            { symbol: 'META', name: 'Meta', logo: '👤', priority: 2 },
            { symbol: 'SPY', name: 'S&P 500 ETF', logo: '📈', priority: 1 },
        ],
        indices: [
            { symbol: 'SPX', name: 'S&P 500', logo: '📊', priority: 1 },
            { symbol: 'DJI', name: 'Dow Jones', logo: '📈', priority: 1 },
            { symbol: 'NASDAQ', name: 'NASDAQ', logo: '💹', priority: 1 },
        ]
    },

    // Trading Analysis Settings
    analysis: {
        // Signal thresholds
        strongBuy: -3,
        buy: -1.5,
        hold: { min: -1.5, max: 1.5 },
        sell: 1.5,
        strongSell: 3,

        // RSI settings
        rsi: {
            period: 14,
            oversold: 30,
            overbought: 70
        },

        // Risk levels
        riskLevels: {
            low: 25,
            medium: 50,
            high: 75
        },

        // Confidence thresholds
        confidence: {
            high: 75,
            medium: 50,
            low: 25
        }
    },

    // Locations for display
    locations: [
        { name: 'TOKYO', flag: '🇯🇵', timezone: 'Asia/Tokyo' },
        { name: 'LONDON', flag: '🇬🇧', timezone: 'Europe/London' },
        { name: 'NEW YORK', flag: '🇺🇸', timezone: 'America/New_York' },
        { name: 'DUBAI', flag: '🇦🇪', timezone: 'Asia/Dubai' },
        { name: 'SINGAPORE', flag: '🇸🇬', timezone: 'Asia/Singapore' },
        { name: 'SYDNEY', flag: '🇦🇺', timezone: 'Australia/Sydney' },
        { name: 'FRANKFURT', flag: '🇩🇪', timezone: 'Europe/Berlin' },
        { name: 'HONG KONG', flag: '🇭🇰', timezone: 'Asia/Hong_Kong' },
    ],

    // Bot messages
    messages: {
        welcome: `🤖 **مرحباً بك في ALI BRAIN CLOUD SYNC**

أنا بوت التحليل المالي الذكي المتطور.

━━━━━━━━━━━━━━━━━━━━━━

📋 **الأوامر المتاحة:**

/analyze - تحليل السوق الكامل
/price - أسعار العملات والأسهم
/signal - إشارة التداول السريعة
/platforms - منصات التداول الموصى بها
/opportunities - أفضل فرص التداول
/watchlist - قائمة المراقبة
/status - حالة النظام
/help - المساعدة

━━━━━━━━━━━━━━━━━━━━━━

⚠️ **تنبيه:** هذا البوت للأغراض التعليمية فقط. ليس نصيحة مالية.`,
        help: `📊 **الأوامر المتاحة:**

/analyze - تحليل السوق الكامل مع التوصيات
/price - أسعار العملات والأسهم الحالية
/signal - إشارة التداول السريعة
/platforms - عرض منصات التداول الموصى بها
/opportunities - أفضل فرص البيع والشراء
/watchlist - قائمة المراقبة الذكية
/status - حالة النظام
/help - المساعدة`,
    },

    // Bot info
    botInfo: {
        name: 'ALI BRAIN CLOUD SYNC',
        version: '3.0.0',
        author: 'Ali Alkhafajy'
    }
};
