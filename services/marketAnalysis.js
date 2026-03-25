/**
 * Market Analysis Service - خدمة تحليل السوق الذكية
 * تحليل متقدم مع توصيات المنصات والأصول
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
     * 🔥 التحليل الرئيسي
     */
    async analyze() {
        try {
            const marketData = await priceService.getAllMarketPrices();
            const btc = marketData.crypto.find(c => c.symbol === 'BTC') || marketData.crypto[0];

            if (!btc) {
                return this.getEmergencyAnalysis();
            }

            const changes = priceService.calculateChanges('BTC');
            const indicators = this.calculateIndicators(btc, changes);
            const signal = this.determineSignal(indicators, btc);
            const risk = this.calculateRisk(indicators, btc);
            const strategy = this.determineStrategy(indicators, signal);

            // 🆕 العثور على أفضل الفرص
            const opportunities = await priceService.findTradingOpportunities();

            // 🆕 المنصات الموصى بها
            const recommendedPlatforms = priceService.getRecommendedPlatforms();

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
                opportunities: opportunities.slice(0, 5),
                recommendedPlatforms,
                timestamp: Date.now(),
                reasons: signal.reasons
            };

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
        const history = priceService.getPriceHistory('BTC');
        const momentum = this.calculateMomentum(history);
        const rsi = this.calculateRSI(history);
        const trend = this.determineTrend(changes);
        const volatility = this.calculateVolatility(history);
        const supportResistance = this.calculateSupportResistance(history);
        const volumeSignal = btc.volume ? this.analyzeVolume(btc.volume) : 'neutral';
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

    calculateMomentum(history) {
        if (history.length < 5) return 'neutral';
        const recent = history.slice(-5);
        const older = history.slice(-10, -5);
        const recentAvg = recent.reduce((sum, h) => sum + h.price, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, h) => sum + h.price, 0) / older.length : recentAvg;
        const momentum = ((recentAvg - olderAvg) / olderAvg) * 100;
        if (momentum > 0.5) return 'bullish';
        if (momentum < -0.5) return 'bearish';
        return 'neutral';
    }

    calculateRSI(history) {
        if (history.length < 2) return 50;
        let gains = 0, losses = 0;
        for (let i = 1; i < history.length; i++) {
            const change = history[i].price - history[i - 1].price;
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        const avgGain = gains / history.length;
        const avgLoss = losses / history.length;
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return Math.round(100 - (100 / (1 + rs)));
    }

    determineTrend(changes) {
        const { change5m, change15m, change1h } = changes;
        if (parseFloat(change5m) > 0.1 && parseFloat(change15m) > 0.2) {
            return { direction: 'strong_bullish', strength: 3 };
        }
        if (parseFloat(change5m) > 0 && parseFloat(change15m) > 0) {
            return { direction: 'bullish', strength: 2 };
        }
        if (parseFloat(change5m) < -0.1 && parseFloat(change15m) < -0.2) {
            return { direction: 'strong_bearish', strength: 3 };
        }
        if (parseFloat(change5m) < 0 && parseFloat(change15m) < 0) {
            return { direction: 'bearish', strength: 2 };
        }
        return { direction: 'neutral', strength: 1 };
    }

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

    calculateSupportResistance(history) {
        if (history.length < 5) return { support: null, resistance: null };
        const prices = history.map(h => h.price);
        const currentPrice = prices[prices.length - 1];
        const minPrice = Math.min(...prices.slice(0, -1));
        const maxPrice = Math.max(...prices.slice(0, -1));
        return {
            support: minPrice,
            resistance: maxPrice,
            nearSupport: currentPrice < minPrice * 1.02,
            nearResistance: currentPrice > maxPrice * 0.98
        };
    }

    analyzeVolume(volume) {
        if (volume > 35000) return 'high';
        if (volume < 15000) return 'low';
        return 'normal';
    }

    calculateStrength(priceChange, rsi, momentum) {
        let score = 0;
        if (priceChange < -2) score += 2;
        else if (priceChange < -1) score += 1;
        else if (priceChange > 2) score -= 2;
        else if (priceChange > 1) score -= 1;
        if (rsi < 30) score += 2;
        else if (rsi < 40) score += 1;
        else if (rsi > 70) score -= 2;
        else if (rsi > 60) score -= 1;
        if (momentum === 'bullish') score -= 1;
        if (momentum === 'bearish') score += 1;
        return score;
    }

    /**
     * 🎯 تحديد الإشارة
     */
    determineSignal(indicators, btc) {
        let buyScore = 0;
        let sellScore = 0;
        const reasons = [];

        // تحليل تغير السعر
        if (btc.priceChangePercent < -3) {
            buyScore += 3;
            reasons.push('📉 انخفاض حاد أكثر من 3%');
        } else if (btc.priceChangePercent < -1.5) {
            buyScore += 2;
            reasons.push('📉 انخفاض معتدل');
        } else if (btc.priceChangePercent > 3) {
            sellScore += 3;
            reasons.push('📈 ارتفاع حاد أكثر من 3%');
        } else if (btc.priceChangePercent > 1.5) {
            sellScore += 2;
            reasons.push('📈 ارتفاع معتدل');
        }

        // RSI
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

        // الاتجاه
        if (indicators.trend.direction === 'strong_bullish') {
            sellScore += 2;
            reasons.push('⬆️ اتجاه صاعد قوي');
        } else if (indicators.trend.direction === 'strong_bearish') {
            buyScore += 2;
            reasons.push('⬇️ اتجاه هابط قوي');
        }

        // الدعم والمقاومة
        if (indicators.supportResistance.nearSupport) {
            buyScore += 2;
            reasons.push('🎯 قرب مستوى دعم');
        }
        if (indicators.supportResistance.nearResistance) {
            sellScore += 2;
            reasons.push('🎯 قرب مستوى مقاومة');
        }

        // الزخم
        if (indicators.momentum === 'bullish') sellScore += 1;
        else if (indicators.momentum === 'bearish') buyScore += 1;

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
            if (indicators.strength > 0) {
                signal = 'WEAK BUY';
                emoji = '🟡';
                strength = 'low';
                confidence = 52;
            } else if (indicators.strength < 0) {
                signal = 'WEAK SELL';
                emoji = '🟠';
                strength = 'low';
                confidence = 52;
            } else {
                signal = 'HOLD';
                emoji = '⏸️';
                strength = 'neutral';
                confidence = 50;
                reasons.push('📊 السوق متوازن');
            }
        }

        return { type: signal, emoji, strength, confidence, reasons };
    }

    calculateRisk(indicators, btc) {
        let riskScore = 50;
        if (indicators.volatility === 'high') riskScore += 15;
        else if (indicators.volatility === 'low') riskScore -= 10;
        if (indicators.rsi > 70 || indicators.rsi < 30) riskScore += 10;
        if (Math.abs(btc.priceChangePercent) > 3) riskScore += 10;

        let level;
        if (riskScore >= 75) level = 'HIGH';
        else if (riskScore >= 50) level = 'MEDIUM';
        else level = 'LOW';

        return { level, percent: Math.min(100, Math.max(0, riskScore)) };
    }

    determineStrategy(indicators, signal) {
        if (signal.type.includes('BUY') && signal.confidence > 70) {
            return { status: 'Accumulating', emoji: '📈' };
        } else if (signal.type.includes('SELL') && signal.confidence > 70) {
            return { status: 'Distribution', emoji: '📉' };
        } else if (signal.type === 'HOLD') {
            return { status: 'Monitoring', emoji: '👁️' };
        } else if (Math.abs(indicators.priceChange24h) > 2) {
            return { status: 'Active Trading', emoji: '⚡' };
        }
        return { status: 'Calibrating', emoji: '🔄' };
    }

    getEmergencyAnalysis() {
        return {
            signal: 'HOLD',
            signalEmoji: '⏸️',
            signalStrength: 'neutral',
            confidence: 30,
            risk: { level: 'HIGH', percent: 75 },
            strategy: 'Error Recovery',
            strategyEmoji: '⚠️',
            price: 68500,
            priceChange: 0,
            indicators: {},
            marketData: null,
            opportunities: [],
            recommendedPlatforms: priceService.getRecommendedPlatforms(),
            timestamp: Date.now(),
            reasons: ['⚠️ خطأ في جلب البيانات']
        };
    }

    getLastAnalysis() {
        return this.lastAnalysis || this.getEmergencyAnalysis();
    }

    getSignalHistory(count = 10) {
        return this.analysisHistory.slice(-count);
    }
}

module.exports = new MarketAnalysis();
