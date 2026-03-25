# ALI BRAIN CLOUD SYNC 🤖

**بوت تلغرام ذكي للتداول مع تحليل متقدم وعرض المنصات والفرص**

---

## 🆕 الميزات الجديدة v3.0

### 🏦 عرض منصات التداول الموصى بها

| المنصة | النوع | المميزات |
|--------|-------|----------|
| 🟡 **Binance** | Crypto | أكبر منصة، رسوم منخفضة |
| 🔵 **Coinbase** | Crypto | سهلة للمبتدئين، آمنة |
| 🟠 **Bybit** | Crypto | Derivatives، Copy Trading |
| 📗 **eToro** | Stocks | Copy Trading، سهل |
| 📘 **Interactive Brokers** | Stocks | احترافي، كل الأسواق |
| 🔶 **OANDA** | Forex | فوركس محترف، تنظيم قوي |

### 📊 الأصول المدعومة

**Cryptocurrencies:**
- ₿ Bitcoin (BTC)
- Ξ Ethereum (ETH)
- 🔶 BNB
- ◎ Solana (SOL)
- ✕ Ripple (XRP)
- Ð Dogecoin (DOGE)

**Stocks:**
- 🍎 Apple (AAPL)
- 🚗 Tesla (TSLA)
- 💚 NVIDIA (NVDA)
- 💻 Microsoft (MSFT)
- 🔍 Google (GOOGL)
- 📦 Amazon (AMZN)

### 🎯 فرص التداول الذكية

البوت يبحث تلقائياً عن:
- 🟢 فرص الشراء (عند الانخفاض الحاد)
- 🔴 فرص البيع (عند الارتفاع الحاد)
- أفضل الأصول للتداول الآن

---

## 📱 أوامر البوت

| الأمر | الوصف |
|-------|-------|
| `/start` | بدء البوت |
| `/analyze` | تحليل السوق الكامل مع الفرص |
| `/price` | أسعار العملات والأسهم |
| `/signal` | إشارة التداول السريعة |
| `/platforms` | 🆕 عرض منصات التداول الموصى بها |
| `/opportunities` | 🆕 أفضل فرص البيع والشراء |
| `/watchlist` | 🆕 قائمة المراقبة الذكية |
| `/status` | حالة النظام |
| `/help` | المساعدة |

---

## 🚀 النشر على Vercel + Supabase

### 1️⃣ إعداد Supabase

```sql
-- انسخ هذا في SQL Editor
CREATE TABLE analyses (
    id BIGSERIAL PRIMARY KEY,
    signal VARCHAR(50),
    price DECIMAL(20, 2),
    confidence INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20),
    price DECIMAL(20, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2️⃣ النشر على Vercel

1. Import Repository: `AliAlk88/Ali`
2. Add Environment Variables:
   - `BOT_TOKEN` = توكن البوت من @BotFather
   - `SUPABASE_URL` = رابط مشروع Supabase
   - `SUPABASE_ANON_KEY` = مفتاح Supabase

### 3️⃣ تفعيل Webhook

```
https://your-app.vercel.app/api/set-webhook
```

### 4️⃣ UptimeRobot

```
URL: https://your-app.vercel.app/api/analyze
Interval: 5 minutes
```

---

## 📁 هيكل المشروع

```
ali-brain-telegram-bot/
├── api/                    # Vercel Functions
│   ├── webhook.js          # معالج Telegram
│   ├── analyze.js          # API التحليل
│   ├── status.js           # API الحالة
│   └── set-webhook.js      # ضبط Webhook
├── lib/
│   ├── supabase.js         # قاعدة البيانات
│   └── bot.js              # معالجات البوت
├── services/
│   ├── priceService.js     # خدمة الأسعار (متعددة المنصات)
│   └── marketAnalysis.js   # خوارزمية التحليل
├── config.js               # الإعدادات (المنصات والأصول)
├── vercel.json
└── supabase-schema.sql
```

---

## 🔧 خوارزمية التحليل

### نظام النقاط:

| المؤشر | وزن | الشرط |
|--------|-----|-------|
| تغير السعر | 30% | انخفاض > 3% = +3 شراء |
| RSI | 25% | RSI < 30 = +3 شراء |
| الاتجاه | 20% | هابط قوي = +2 شراء |
| الدعم/المقاومة | 15% | قرب الدعم = +2 شراء |
| الزخم | 10% | bearish = +1 شراء |

### الإشارات:

```
🚀🟢 STRONG BUY  (نقاط ≥ 4)
🟢 BUY           (نقاط 2-3)
🟡 WEAK BUY      (نقاط 1)
⏸️ HOLD          (نقاط 0)
🟠 WEAK SELL     (نقاط -1)
🔴 SELL          (نقاط -2 إلى -3)
🔻🔴 STRONG SELL  (نقاط ≤ -4)
```

---

## ⚠️ تنبيه

هذا البوت للأغراض التعليمية فقط.
**ليس نصيحة مالية.** التداول ينطوي على مخاطر عالية.

---

## 👨‍💻 المطور

**Ali Alkhafajy**

[GitHub](https://github.com/AliAlk88)

---

*Version 3.0.0 - Smart Trading Bot with Platforms & Opportunities*
