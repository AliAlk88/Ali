/**
 * Price Service - جلب أسعار العملات الرقمية
 * يدعم APIs متعددة للحصول على أسعار حقيقية
 */

const config = require('../config');

class PriceService {
    constructor() {
        this.priceHistory = [];
        this.lastPrice = null;
        this.lastUpdate = null;
        this.cache = {
            btc: null,
            eth: null,
            sp500: null,
            timestamp: null
        };
    }

    /**
     * جلب سعر Bitcoin من Binance
     */
    async getBtcPrice() {
        try {
            const response = await fetch(`${config.apis.binance.baseUrl}${config.apis.binance.endpoints.btc24h}`);

            if (!response.ok) {
                throw new Error(`Binance API error: ${response.status}`);
            }

            const data = await response.json();

            const priceData = {
                symbol: 'BTCUSDT',
                price: parseFloat(data.lastPrice),
                priceChange: parseFloat(data.priceChange),
                priceChangePercent: parseFloat(data.priceChangePercent),
                highPrice: parseFloat(data.highPrice),
                lowPrice: parseFloat(data.lowPrice),
                volume: parseFloat(data.volume),
                quoteVolume: parseFloat(data.quoteVolume),
                openPrice: parseFloat(data.openPrice),
                timestamp: Date.now()
            };

            // حفظ في التاريخ
            this.addToHistory(priceData);

            return priceData;
        } catch (error) {
            console.error('Error fetching BTC price from Binance:', error.message);
            // محاولة استخدام CoinGecko كبديل
            return await this.getBtcPriceCoinGecko();
        }
    }

    /**
     * جلب سعر Bitcoin من CoinGecko (بديل)
     */
    async getBtcPriceCoinGecko() {
        try {
            const response = await fetch(`${config.apis.coinGecko.baseUrl}${config.apis.coinGecko.endpoints.bitcoin}`);

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }

            const data = await response.json();

            const priceData = {
                symbol: 'BTCUSDT',
                price: data.bitcoin.usd,
                priceChangePercent: data.bitcoin.usd_24h_change || 0,
                timestamp: Date.now()
            };

            this.addToHistory(priceData);

            return priceData;
        } catch (error) {
            console.error('Error fetching BTC price from CoinGecko:', error.message);
            // إرجاع بيانات تجريبية في حالة فشل كل الـ APIs
            return this.getMockPrice();
        }
    }

    /**
     * بيانات تجريبية للاختبار
     */
    getMockPrice() {
        const basePrice = 68500;
        const variation = (Math.random() - 0.5) * 500;
        const price = basePrice + variation;
        const changePercent = (Math.random() - 0.5) * 5; // بين -2.5% و +2.5%

        return {
            symbol: 'BTCUSDT',
            price: price,
            priceChange: price * (changePercent / 100),
            priceChangePercent: changePercent,
            highPrice: basePrice + 300 + Math.random() * 200,
            lowPrice: basePrice - 300 - Math.random() * 200,
            volume: 25000 + Math.random() * 5000,
            timestamp: Date.now(),
            isMock: true
        };
    }

    /**
     * جلب سعر Ethereum
     */
    async getEthPrice() {
        try {
            const response = await fetch(`${config.apis.binance.baseUrl}${config.apis.binance.endpoints.ethPrice}`);

            if (!response.ok) {
                throw new Error(`Binance API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                symbol: 'ETHUSDT',
                price: parseFloat(data.price),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error fetching ETH price:', error.message);
            return {
                symbol: 'ETHUSDT',
                price: 3500 + (Math.random() - 0.5) * 100,
                timestamp: Date.now(),
                isMock: true
            };
        }
    }

    /**
     * جلب سعر S&P 500 (تقريبي)
     */
    async getSp500Price() {
        // S&P 500 لا يتوفر API مجاني سهل، نستخدم قيمة تقريبية
        // في الإنتاج، يمكن استخدام Alpha Vantage أو Yahoo Finance
        const basePrice = 5100;
        const variation = (Math.random() - 0.5) * 20;

        return {
            symbol: 'SPX',
            price: basePrice + variation,
            change: (Math.random() - 0.5) * 0.5,
            timestamp: Date.now()
        };
    }

    /**
     * إضافة بيانات للتاريخ
     */
    addToHistory(priceData) {
        this.priceHistory.push({
            price: priceData.price,
            timestamp: priceData.timestamp,
            change: priceData.priceChangePercent
        });

        // الاحتفاظ بآخر 100 سجل فقط
        if (this.priceHistory.length > 100) {
            this.priceHistory.shift();
        }

        this.lastPrice = priceData;
        this.lastUpdate = Date.now();
    }

    /**
     * الحصول على تاريخ الأسعار
     */
    getPriceHistory(count = 20) {
        return this.priceHistory.slice(-count);
    }

    /**
     * حساب التغيرات عبر فترات مختلفة
     */
    calculateChanges() {
        const history = this.priceHistory;

        if (history.length < 2) {
            return {
                change5m: 0,
                change15m: 0,
                change1h: 0,
                trend: 'neutral'
            };
        }

        const currentPrice = history[history.length - 1].price;
        const now = Date.now();

        // إيجاد الأسعار في الأوقات المختلفة
        const price5mAgo = this.findPriceAt(now - 5 * 60 * 1000);
        const price15mAgo = this.findPriceAt(now - 15 * 60 * 1000);
        const price1hAgo = this.findPriceAt(now - 60 * 60 * 1000);

        const change5m = price5mAgo ? ((currentPrice - price5mAgo) / price5mAgo) * 100 : 0;
        const change15m = price15mAgo ? ((currentPrice - price15mAgo) / price15mAgo) * 100 : 0;
        const change1h = price1hAgo ? ((currentPrice - price1hAgo) / price1hAgo) * 100 : 0;

        // تحديد الاتجاه العام
        let trend = 'neutral';
        if (change5m > 0.1 && change15m > 0.2) {
            trend = 'bullish';
        } else if (change5m < -0.1 && change15m < -0.2) {
            trend = 'bearish';
        }

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
    findPriceAt(targetTime) {
        for (let i = this.priceHistory.length - 1; i >= 0; i--) {
            if (this.priceHistory[i].timestamp <= targetTime) {
                return this.priceHistory[i].price;
            }
        }
        return null;
    }

    /**
     * جلب كل البيانات المطلوبة
     */
    async getAllMarketData() {
        const [btc, eth, sp500] = await Promise.all([
            this.getBtcPrice(),
            this.getEthPrice(),
            this.getSp500Price()
        ]);

        return {
            btc,
            eth,
            sp500,
            changes: this.calculateChanges(),
            timestamp: Date.now()
        };
    }
}

// تصدير singleton instance
module.exports = new PriceService();
