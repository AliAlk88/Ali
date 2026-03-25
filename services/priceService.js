/**
 * Price Service - جلب أسعار العملات والأسهم
 * يدعم APIs متعددة للحصول على أسعار حقيقية
 */

const config = require('../config');

class PriceService {
    constructor() {
        this.priceHistory = {};
        this.lastPrices = {};
        this.cache = { timestamp: null };
    }

    /**
     * جلب سعر عملة رقمية من Binance
     */
    async getCryptoPrice(symbol = 'BTC') {
        const pair = `${symbol}USDT`;
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`);

            if (!response.ok) {
                throw new Error(`Binance API error: ${response.status}`);
            }

            const data = await response.json();

            const priceData = {
                symbol: symbol,
                name: this.getAssetName(symbol, 'crypto'),
                logo: this.getAssetLogo(symbol, 'crypto'),
                type: 'crypto',
                price: parseFloat(data.lastPrice),
                priceChange: parseFloat(data.priceChange),
                priceChangePercent: parseFloat(data.priceChangePercent),
                highPrice: parseFloat(data.highPrice),
                lowPrice: parseFloat(data.lowPrice),
                volume: parseFloat(data.volume),
                quoteVolume: parseFloat(data.quoteVolume),
                timestamp: Date.now()
            };

            this.addToHistory(symbol, priceData);
            return priceData;
        } catch (error) {
            console.error(`Error fetching ${symbol} price:`, error.message);
            return this.getMockCryptoPrice(symbol);
        }
    }

    /**
     * جلب أسعار عملات رقمية متعددة
     */
    async getMultipleCryptoPrices(symbols = ['BTC', 'ETH', 'SOL', 'BNB']) {
        const promises = symbols.map(s => this.getCryptoPrice(s));
        const results = await Promise.allSettled(promises);

        return results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);
    }

    /**
     * جلب سعر سهم (محاكاة - يحتاج API مدفوع للبيانات الحقيقية)
     */
    async getStockPrice(symbol) {
        // محاكاة أسعار الأسهم
        // في الإنتاج، استخدم Alpha Vantage, Yahoo Finance, أو IEX Cloud
        const stockPrices = {
            'AAPL': { base: 178, name: 'Apple', logo: '🍎' },
            'TSLA': { base: 248, name: 'Tesla', logo: '🚗' },
            'NVDA': { base: 875, name: 'NVIDIA', logo: '💚' },
            'MSFT': { base: 415, name: 'Microsoft', logo: '💻' },
            'GOOGL': { base: 155, name: 'Google', logo: '🔍' },
            'AMZN': { base: 185, name: 'Amazon', logo: '📦' },
            'META': { base: 505, name: 'Meta', logo: '👤' },
            'SPY': { base: 510, name: 'S&P 500 ETF', logo: '📈' },
        };

        const stock = stockPrices[symbol] || { base: 100, name: symbol, logo: '📊' };
        const variation = (Math.random() - 0.5) * stock.base * 0.02;
        const changePercent = (Math.random() - 0.5) * 3;

        return {
            symbol: symbol,
            name: stock.name,
            logo: stock.logo,
            type: 'stock',
            price: stock.base + variation,
            priceChange: (stock.base + variation) * (changePercent / 100),
            priceChangePercent: changePercent,
            highPrice: stock.base * 1.015 + variation,
            lowPrice: stock.base * 0.985 + variation,
            volume: Math.floor(Math.random() * 50000000) + 10000000,
            timestamp: Date.now(),
            isMock: true
        };
    }

    /**
     * جلب أسعار أسهم متعددة
     */
    async getMultipleStockPrices(symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT']) {
        const promises = symbols.map(s => this.getStockPrice(s));
        return await Promise.all(promises);
    }

    /**
     * جلب سعر المؤشرات
     */
    async getIndexPrice(symbol) {
        const indices = {
            'SPX': { base: 5100, name: 'S&P 500', logo: '📊' },
            'DJI': { base: 38500, name: 'Dow Jones', logo: '📈' },
            'NASDAQ': { base: 16200, name: 'NASDAQ', logo: '💹' },
        };

        const index = indices[symbol] || { base: 1000, name: symbol, logo: '📊' };
        const variation = (Math.random() - 0.5) * index.base * 0.005;
        const changePercent = (Math.random() - 0.5) * 1;

        return {
            symbol: symbol,
            name: index.name,
            logo: index.logo,
            type: 'index',
            price: index.base + variation,
            priceChange: (index.base + variation) * (changePercent / 100),
            priceChangePercent: changePercent,
            timestamp: Date.now(),
            isMock: true
        };
    }

    /**
     * جلب كل أسعار السوق
     */
    async getAllMarketPrices() {
        try {
            const [crypto, stocks, indices] = await Promise.all([
                this.getMultipleCryptoPrices(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE']),
                this.getMultipleStockPrices(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']),
                Promise.all([this.getIndexPrice('SPX'), this.getIndexPrice('NASDAQ')])
            ]);

            return {
                crypto,
                stocks,
                indices,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error fetching market prices:', error.message);
            return {
                crypto: [],
                stocks: [],
                indices: [],
                timestamp: Date.now(),
                error: error.message
            };
        }
    }

    /**
     * بيانات تجريبية للعملات الرقمية
     */
    getMockCryptoPrice(symbol) {
        const bases = {
            'BTC': 68500,
            'ETH': 3450,
            'BNB': 580,
            'SOL': 145,
            'XRP': 0.52,
            'ADA': 0.45,
            'DOGE': 0.12,
            'DOT': 7.2
        };

        const base = bases[symbol] || 100;
        const variation = (Math.random() - 0.5) * base * 0.02;
        const price = base + variation;
        const changePercent = (Math.random() - 0.5) * 5;

        return {
            symbol: symbol,
            name: this.getAssetName(symbol, 'crypto'),
            logo: this.getAssetLogo(symbol, 'crypto'),
            type: 'crypto',
            price: price,
            priceChange: price * (changePercent / 100),
            priceChangePercent: changePercent,
            highPrice: base * 1.02 + variation,
            lowPrice: base * 0.98 + variation,
            volume: Math.floor(Math.random() * 1000000000),
            timestamp: Date.now(),
            isMock: true
        };
    }

    /**
     * الحصول على اسم الأصل
     */
    getAssetName(symbol, type) {
        const assets = config.assets[type] || [];
        const asset = assets.find(a => a.symbol === symbol);
        return asset?.name || symbol;
    }

    /**
     * الحصول على شعار الأصل
     */
    getAssetLogo(symbol, type) {
        const assets = config.assets[type] || [];
        const asset = assets.find(a => a.symbol === symbol);
        return asset?.logo || '📊';
    }

    /**
     * إضافة بيانات للتاريخ
     */
    addToHistory(symbol, priceData) {
        if (!this.priceHistory[symbol]) {
            this.priceHistory[symbol] = [];
        }

        this.priceHistory[symbol].push({
            price: priceData.price,
            timestamp: priceData.timestamp,
            change: priceData.priceChangePercent
        });

        // الاحتفاظ بآخر 100 سجل فقط
        if (this.priceHistory[symbol].length > 100) {
            this.priceHistory[symbol].shift();
        }

        this.lastPrices[symbol] = priceData;
    }

    /**
     * الحصول على تاريخ الأسعار
     */
    getPriceHistory(symbol, count = 20) {
        const history = this.priceHistory[symbol] || [];
        return history.slice(-count);
    }

    /**
     * حساب التغيرات
     */
    calculateChanges(symbol) {
        const history = this.priceHistory[symbol] || [];

        if (history.length < 2) {
            return { change5m: 0, change15m: 0, change1h: 0, trend: 'neutral' };
        }

        const currentPrice = history[history.length - 1].price;
        const now = Date.now();

        const price5mAgo = this.findPriceAt(symbol, now - 5 * 60 * 1000);
        const price15mAgo = this.findPriceAt(symbol, now - 15 * 60 * 1000);
        const price1hAgo = this.findPriceAt(symbol, now - 60 * 60 * 1000);

        const change5m = price5mAgo ? ((currentPrice - price5mAgo) / price5mAgo) * 100 : 0;
        const change15m = price15mAgo ? ((currentPrice - price15mAgo) / price15mAgo) * 100 : 0;
        const change1h = price1hAgo ? ((currentPrice - price1hAgo) / price1hAgo) * 100 : 0;

        let trend = 'neutral';
        if (change5m > 0.1 && change15m > 0.2) trend = 'bullish';
        else if (change5m < -0.1 && change15m < -0.2) trend = 'bearish';

        return {
            change5m: change5m.toFixed(3),
            change15m: change15m.toFixed(3),
            change1h: change1h.toFixed(3),
            trend
        };
    }

    /**
     * إيجاد السعر في وقت معين
     */
    findPriceAt(symbol, targetTime) {
        const history = this.priceHistory[symbol] || [];
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].timestamp <= targetTime) {
                return history[i].price;
            }
        }
        return null;
    }

    /**
     * تحديد أفضل فرص التداول
     */
    async findTradingOpportunities() {
        const marketData = await this.getAllMarketPrices();
        const opportunities = [];

        // تحليل العملات الرقمية
        for (const crypto of marketData.crypto) {
            const opportunity = this.analyzeOpportunity(crypto);
            if (opportunity.score >= 2 || opportunity.score <= -2) {
                opportunities.push({
                    ...opportunity,
                    asset: crypto,
                    type: 'crypto'
                });
            }
        }

        // تحليل الأسهم
        for (const stock of marketData.stocks) {
            const opportunity = this.analyzeOpportunity(stock);
            if (opportunity.score >= 2 || opportunity.score <= -2) {
                opportunities.push({
                    ...opportunity,
                    asset: stock,
                    type: 'stock'
                });
            }
        }

        // ترتيب حسب الفرصة
        opportunities.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

        return opportunities;
    }

    /**
     * تحليل فرصة التداول
     */
    analyzeOpportunity(asset) {
        let score = 0;
        const reasons = [];

        // تحليل التغير
        if (asset.priceChangePercent < -3) {
            score += 3;
            reasons.push('📉 انخفاض حاد > 3%');
        } else if (asset.priceChangePercent < -1.5) {
            score += 2;
            reasons.push('📉 انخفاض معتدل');
        } else if (asset.priceChangePercent > 3) {
            score -= 3;
            reasons.push('📈 ارتفاع حاد > 3%');
        } else if (asset.priceChangePercent > 1.5) {
            score -= 2;
            reasons.push('📈 ارتفاع معتدل');
        }

        // تحديد الإشارة
        let signal = 'HOLD';
        let emoji = '⏸️';

        if (score >= 3) {
            signal = 'STRONG BUY';
            emoji = '🚀🟢';
        } else if (score >= 2) {
            signal = 'BUY';
            emoji = '🟢';
        } else if (score <= -3) {
            signal = 'STRONG SELL';
            emoji = '🔻🔴';
        } else if (score <= -2) {
            signal = 'SELL';
            emoji = '🔴';
        }

        return {
            signal,
            emoji,
            score,
            reasons,
            confidence: Math.min(95, 50 + Math.abs(score) * 10)
        };
    }

    /**
     * الحصول على المنصات الموصى بها
     */
    getRecommendedPlatforms(type = 'all') {
        const platforms = config.platforms;

        if (type === 'crypto') {
            return platforms.crypto.filter(p => p.recommended);
        } else if (type === 'stocks') {
            return platforms.stocks.filter(p => p.recommended);
        } else if (type === 'forex') {
            return platforms.forex.filter(p => p.recommended);
        }

        return {
            crypto: platforms.crypto.filter(p => p.recommended),
            stocks: platforms.stocks.filter(p => p.recommended),
            forex: platforms.forex.filter(p => p.recommended)
        };
    }
}

// تصدير singleton instance
module.exports = new PriceService();
