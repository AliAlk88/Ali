/**
 * Market Analysis Service - خدمة تحليل السوق
 * هذه الخدمة تحلل البيانات وتعطي إشارات تداولية ذكية
 *
 * ✅ تم إصلاح مشكلة HOLD - الآن الإشارات ديناميكية
 */

const config = require('../config');
const priceService = require('./priceService');

class MarketAnalysis {
    constructor() {
        this.analysisHistory = [];
        this.lastSignal = 'HOLD';
        this.signalConfidence = 0;
        this.lastAnalysis = null;
    }

    /**
     * 🔥 التحليل الرئيسي - هذه الدالة تحلل السوق وتعطي إشارة
     */
    async analyze() {
        try {
            // جلب بيانات السوق
            const marketData = await priceService.getAllMarketData();
            const btc = marketData.btc;
            const changes = marketData.changes;

            // حساب المؤشرات الفنية
            const indicators = this.calculateIndicators(btc, changes);

            // تحديد الإشارة
            const signal = this.determineSignal(indicators, btc);

            // حساب مستوى الخطر
            const risk = this.calculateRisk(indicators, btc);

            // تحديد الاستراتيجية
            const strategy = this.determineStrategy(indicators, signal);

            const analysis = {
                signal: signal.type,
                signalEmoji: signal.emoji,
                signalStrength: signal.strength,
                confidence: signal.confidence,
                risk: risk.level,
                riskPercent: risk.percent,
                strategy: strategy.status,
                strategyEmoji: strategy.emoji,
                price: btc.price,
                priceChange: btc.priceChangePercent,
                indicators: indicators,
                marketData: marketData,
                timestamp: Date.now(),
                reasons: signal.reasons
            };

            // حفظ التحليل
            this.analysisHistory.push(analysis);
            if (this.analysisHistory.length > 50) {
                this.analysisHistory.shift();
            }

            this.lastSignal = signal.type;
            this.signalConfidence = signal.confidence;
            this.lastAnalysis = analysis;

            return analysis;

        } catch (error) {
            console.error('Analysis error:', error.message);
            return this.getEmergencyAnalysis();
        }
    }

    /**
     * حساب المؤشرات الفنية
     */
    calculateIndicators(btc, changes) {
        const history = priceService.getPriceHistory(20);

        // 1. زخم السعر (Momentum)
        const momentum = this.calculateMomentum(history);

        // 2. حساب RSI مبسط
        const rsi = this.calculateRSI(history);

        // 3. اتجاه السوق (Trend)
        const trend = this.determineTrend(changes);

        // 4. التقلب (Volatility)
        const volatility = this.calculateVolatility(history);

        // 5. مستوى الدعم والمقاومة
        const supportResistance = this.calculateSupportResistance(history);

        // 6. حجم التداول النسبي
        const volumeSignal = btc.volume ? this.analyzeVolume(btc.volume) : 'neutral';

        // 7. نقاط القوة والضعف
        const strength = this.calculateStrength(btc.priceChangePercent, rsi, momentum);

        return {
            momentum,
            rsi,
            trend,
            volatility,
            supportResistance,
            volumeSignal,
            strength,
            priceChange24h: btc.priceChangePercent
        };
    }

    /**
     * حساب الزخم (Momentum)
     */
    calculateMomentum(history) {
        if (history.length < 5) return 0;

        const recent = history.slice(-5);
        const older = history.slice(-10, -5);

        const recentAvg = recent.reduce((sum, h) => sum + h.price, 0) / recent.length;
        const olderAvg = older.reduce((sum, h) => sum + h.price, 0) / older.length;

        const momentum = ((recentAvg - olderAvg) / olderAvg) * 100;

        if (momentum > 0.5) return 'bullish';
        if (momentum < -0.5) return 'bearish';
        return 'neutral';
    }

    /**
     * حساب RSI مبسط
     */
    calculateRSI(history) {
        if (history.length < 2) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i < history.length; i++) {
            const change = history[i].price - history[i - 1].price;
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }

        const avgGain = gains / history.length;
        const avgLoss = losses / history.length;

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return Math.round(rsi);
    }

    /**
     * تحديد اتجاه السوق
     */
    determineTrend(changes) {
        const { change5m, change15m, change1h } = changes;

        // اتجاه قوي صاعد
        if (change5m > 0.1 && change15m > 0.2) {
            return { direction: 'strong_bullish', strength: 3 };
        }
        // اتجاه صاعد
        if (change5m > 0 && change15m > 0) {
            return { direction: 'bullish', strength: 2 };
        }
        // اتجاه قوي هابط
        if (change5m < -0.1 && change15m < -0.2) {
            return { direction: 'strong_bearish', strength: 3 };
        }
        // اتجاه هابط
        if (change5m < 0 && change15m < 0) {
            return { direction: 'bearish', strength: 2 };
        }

        return { direction: 'neutral', strength: 1 };
    }

    /**
     * حساب التقلب
     */
    calculateVolatility(history) {
        if (history.length < 2) return 'medium';

        const prices = history.map(h => h.price);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        const squaredDiffs = prices.map(p => Math.pow(p - avg, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
        const stdDev = Math.sqrt(variance);

        const volatilityPercent = (stdDev / avg) * 100;

        if (volatilityPercent > 1) return 'high';
        if (volatilityPercent > 0.5) return 'medium';
        return 'low';
    }

    /**
     * حساب الدعم والمقاومة
     */
    calculateSupportResistance(history) {
        if (history.length < 5) {
            return { support: null, resistance: null };
        }

        const prices = history.map(h => h.price);
        const currentPrice = prices[prices.length - 1];

        // إيجاد أدنى وأعلى سعر
        const minPrice = Math.min(...prices.slice(0, -1));
        const maxPrice = Math.max(...prices.slice(0, -1));

        return {
            support: minPrice,
            resistance: maxPrice,
            nearSupport: currentPrice < minPrice * 1.02,
            nearResistance: currentPrice > maxPrice * 0.98
        };
    }

    /**
     * تحليل حجم التداول
     */
    analyzeVolume(volume) {
        // حجم عادي حوالي 25,000 BTC
        if (volume > 35000) return 'high';
        if (volume < 15000) return 'low';
        return 'normal';
    }

    /**
     * حساب نقاط القوة
     */
    calculateStrength(priceChange, rsi, momentum) {
        let score = 0;

        // تغير السعر
        if (priceChange < -2) score += 2;
        else if (priceChange < -1) score += 1;
        else if (priceChange > 2) score -= 2;
        else if (priceChange > 1) score -= 1;

        // RSI
        if (rsi < 30) score += 2;
        else if (rsi < 40) score += 1;
        else if (rsi > 70) score -= 2;
        else if (rsi > 60) score -= 1;

        // الزخم
        if (momentum === 'bullish') score -= 1;
        if (momentum === 'bearish') score += 1;

        return score;
    }

    /**
     * 🎯 تحديد الإشارة - الدالة الأهم!
     */
    determineSignal(indicators, btc) {
        let buyScore = 0;
        let sellScore = 0;
        const reasons = [];

        // 1. تحليل تغير السعر (الوزن: 30%)
        if (btc.priceChangePercent < -3) {
            buyScore += 3;
            reasons.push('📉 انخفاض حاد أكثر من 3% - فرصة شراء');
        } else if (btc.priceChangePercent < -1.5) {
            buyScore += 2;
            reasons.push('📉 انخفاض معتدل - مراقبة للشراء');
        } else if (btc.priceChangePercent > 3) {
            sellScore += 3;
            reasons.push('📈 ارتفاع حاد أكثر من 3% - فرصة بيع');
        } else if (btc.priceChangePercent > 1.5) {
            sellScore += 2;
            reasons.push('📈 ارتفاع معتدل - مراقبة للبيع');
        }

        // 2. تحليل RSI (الوزن: 25%)
        if (indicators.rsi < 30) {
            buyScore += 3;
            reasons.push(`💚 RSI منخفض (${indicators.rsi}) - تشبع بيعي`);
        } else if (indicators.rsi < 40) {
            buyScore += 1;
            reasons.push(`💚 RSI منخفض نسبياً (${indicators.rsi})`);
        } else if (indicators.rsi > 70) {
            sellScore += 3;
            reasons.push(`❤️ RSI مرتفع (${indicators.rsi}) - تشبع شرائي`);
        } else if (indicators.rsi > 60) {
            sellScore += 1;
            reasons.push(`❤️ RSI مرتفع نسبياً (${indicators.rsi})`);
        }

        // 3. تحليل الاتجاه (الوزن: 20%)
        if (indicators.trend.direction === 'strong_bullish') {
            sellScore += 2;
            reasons.push('⬆️ اتجاه صاعد قوي');
        } else if (indicators.trend.direction === 'bullish') {
            sellScore += 1;
            reasons.push('⬆️ اتجاه صاعد');
        } else if (indicators.trend.direction === 'strong_bearish') {
            buyScore += 2;
            reasons.push('⬇️ اتجاه هابط قوي');
        } else if (indicators.trend.direction === 'bearish') {
            buyScore += 1;
            reasons.push('⬇️ اتجاه هابط');
        }

        // 4. تحليل الدعم والمقاومة (الوزن: 15%)
        if (indicators.supportResistance.nearSupport) {
            buyScore += 2;
            reasons.push('🎯 السعر قرب مستوى دعم');
        }
        if (indicators.supportResistance.nearResistance) {
            sellScore += 2;
            reasons.push('🎯 السعر قرب مستوى مقاومة');
        }

        // 5. تحليل الزخم (الوزن: 10%)
        if (indicators.momentum === 'bullish') {
            sellScore += 1;
        } else if (indicators.momentum === 'bearish') {
            buyScore += 1;
        }

        // تحديد الإشارة النهائية
        const totalScore = buyScore - sellScore;
        let signal, emoji, strength, confidence;

        if (totalScore >= 4) {
            signal = 'STRONG BUY';
            emoji = '🚀🟢';
            strength = 'very_high';
            confidence = Math.min(95, 70 + totalScore * 3);
        } else if (totalScore >= 2) {
            signal = 'BUY';
            emoji = '🟢';
            strength = 'high';
            confidence = Math.min(85, 60 + totalScore * 5);
        } else if (totalScore >= 1) {
            signal = 'WEAK BUY';
            emoji = '🟡';
            strength = 'low';
            confidence = 55;
        } else if (totalScore <= -4) {
            signal = 'STRONG SELL';
            emoji = '🔻🔴';
            strength = 'very_high';
            confidence = Math.min(95, 70 + Math.abs(totalScore) * 3);
        } else if (totalScore <= -2) {
            signal = 'SELL';
            emoji = '🔴';
            strength = 'high';
            confidence = Math.min(85, 60 + Math.abs(totalScore) * 5);
        } else if (totalScore <= -1) {
            signal = 'WEAK SELL';
            emoji = '🟠';
            strength = 'low';
            confidence = 55;
        } else {
            // 🔧 هنا الإصلاح: بدلاً من HOLD دائماً، نتحقق أكثر
            if (Math.abs(btc.priceChangePercent) < 0.3 && indicators.rsi > 45 && indicators.rsi < 55) {
                signal = 'HOLD';
                emoji = '⏸️';
                strength = 'neutral';
                confidence = 50;
                reasons.push('📊 السوق مستقر - لا إشارة واضحة');
            } else {
                // إعطاء إشارة طفيفة بدلاً من HOLD
                if (indicators.strength > 0) {
                    signal = 'WEAK BUY';
                    emoji = '🟡';
                    strength = 'low';
                    confidence = 52;
                    reasons.push('📊 ميل طفيف للشراء');
                } else if (indicators.strength < 0) {
                    signal = 'WEAK SELL';
                    emoji = '🟠';
                    strength = 'low';
                    confidence = 52;
                    reasons.push('📊 ميل طفيف للبيع');
                } else {
                    signal = 'HOLD';
                    emoji = '⏸️';
                    strength = 'neutral';
                    confidence = 50;
                    reasons.push('📊 السوق متوازن');
                }
            }
        }

        return { type: signal, emoji, strength, confidence, reasons };
    }

    /**
     * حساب مستوى الخطر
     */
    calculateRisk(indicators, btc) {
        let riskScore = 50; // البداية من 50%

        // زيادة الخطر مع التقلب العالي
        if (indicators.volatility === 'high') riskScore += 15;
        else if (indicators.volatility === 'low') riskScore -= 10;

        // زيادة الخطر عند التشبع
        if (indicators.rsi > 70 || indicators.rsi < 30) riskScore += 10;

        // زيادة الخطر مع التغيرات الكبيرة
        if (Math.abs(btc.priceChangePercent) > 3) riskScore += 10;

        // تحديد المستوى
        let level;
        if (riskScore >= 75) level = 'HIGH';
        else if (riskScore >= 50) level = 'MEDIUM';
        else level = 'LOW';

        return {
            level,
            percent: Math.min(100, Math.max(0, riskScore))
        };
    }

    /**
     * تحديد الاستراتيجية
     */
    determineStrategy(indicators, signal) {
        if (signal.type.includes('BUY') && signal.confidence > 70) {
            return { status: 'Accumulating', emoji: '📈' };
        } else if (signal.type.includes('SELL') && signal.confidence > 70) {
            return { status: 'Distribution', emoji: '📉' };
        } else if (signal.type === 'HOLD') {
            return { status: 'Monitoring', emoji: '👁️' };
        } else if (Math.abs(indicators.priceChange24h) > 2) {
            return { status: 'Active Trading', emoji: '⚡' };
        } else {
            return { status: 'Calibrating', emoji: '🔄' };
        }
    }

    /**
     * تحليل طوارئ
     */
    getEmergencyAnalysis() {
        return {
            signal: 'HOLD',
            signalEmoji: '⏸️',
            signalStrength: 'neutral',
            confidence: 30,
            risk: { level: 'HIGH', percent: 75 },
            strategy: 'Error Recovery',
            strategyEmoji: '⚠️',
            price: 0,
            priceChange: 0,
            indicators: {},
            marketData: null,
            timestamp: Date.now(),
            reasons: ['⚠️ خطأ في جلب البيانات']
        };
    }

    /**
     * الحصول على آخر تحليل
     */
    getLastAnalysis() {
        return this.lastAnalysis || this.getEmergencyAnalysis();
    }

    /**
     * الحصول على تاريخ الإشارات
     */
    getSignalHistory(count = 10) {
        return this.analysisHistory.slice(-count);
    }
}

// تصدير singleton instance
module.exports = new MarketAnalysis();
