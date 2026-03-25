# ALI BRAIN CLOUD SYNC 🤖

**Telegram Trading Bot with Smart Analysis**

## ✅ تم إصلاح مشكلة HOLD!

الآن البوت يعطي إشارات حقيقية وديناميكية بناءً على تحليل فني متعدد المؤشرات.

---

## 🚀 الاستضافة على Vercel + Supabase

### 📋 المتطلبات:

1. حساب [Vercel](https://vercel.com)
2. مشروع [Supabase](https://supabase.com)
3. بوت Telegram من [@BotFather](https://t.me/BotFather)

---

## 📝 خطوات الإعداد:

### 1️⃣ إعداد Supabase

1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. اذهب إلى **SQL Editor**
3. انسخ والصق محتوى ملف `supabase-schema.sql`
4. اضغط **Run** لإنشاء الجداول
5. انسخ من **Settings > API**:
   - `Project URL` → SUPABASE_URL
   - `anon public key` → SUPABASE_ANON_KEY

### 2️⃣ إعداد Vercel

1. اذهب إلى [Vercel](https://vercel.com)
2. اضغط **New Project**
3. اختر **Import Git Repository**
4. اختر مستودع `AliAlk88/Ali`
5. أضف Environment Variables:

```
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

6. اضغط **Deploy**

### 3️⃣ تفعيل Webhook

بعد النشر، افتح الرابط:
```
https://your-app.vercel.app/api/set-webhook
```

ستظهر رسالة نجاح تعني أن البوت جاهز!

### 4️⃣ إعداد UptimeRobot (اختياري)

1. اذهب إلى [UptimeRobot](https://uptimerobot.com)
2. أضف Monitor جديد:
   - Type: HTTP(s)
   - URL: `https://your-app.vercel.app/api/analyze`
   - Interval: 5 minutes

هذا يضمن تحديث البيانات بشكل منتظم.

---

## 📁 هيكل المشروع:

```
ali-brain-telegram-bot/
├── api/                    # Vercel Serverless Functions
│   ├── webhook.js          # معالج Telegram Webhook
│   ├── analyze.js          # API تحليل السوق
│   ├── status.js           # API حالة النظام
│   └── set-webhook.js      # ضبط الـ Webhook
├── lib/
│   ├── supabase.js         # عميل Supabase
│   └── bot.js              # معالجات البوت
├── services/
│   ├── priceService.js     # خدمة الأسعار
│   └── marketAnalysis.js   # خوارزمية التحليل
├── index.js                # للتشغيل المحلي
├── config.js               # الإعدادات
├── vercel.json             # تكوين Vercel
├── supabase-schema.sql     # هيكل قاعدة البيانات
└── package.json
```

---

## 📱 أوامر البوت:

| الأمر | الوصف |
|-------|-------|
| `/start` | بدء البوت |
| `/analyze` | تحليل السوق الكامل |
| `/price` | أسعار العملات الحالية |
| `/signal` | إشارة التداول السريعة |
| `/status` | حالة النظام |
| `/help` | المساعدة |

---

## 🔧 كيف تعمل خوارزمية التحليل؟

### الإشارات المتاحة:

| الإشارة | الوصف | الشرط |
|---------|-------|-------|
| 🚀🟢 **STRONG BUY** | شراء قوي | نقاط ≥ 4 |
| 🟢 **BUY** | شراء | نقاط 2-3 |
| 🟡 **WEAK BUY** | ميل للشراء | نقاط 1 |
| ⏸️ **HOLD** | انتظار | نقاط 0 |
| 🟠 **WEAK SELL** | ميل للبيع | نقاط -1 |
| 🔴 **SELL** | بيع | نقاط -2 إلى -3 |
| 🔻🔴 **STRONG SELL** | بيع قوي | نقاط ≤ -4 |

### المؤشرات المستخدمة:

| المؤشر | الوزن | الاستخدام |
|--------|-------|-----------|
| تغير السعر 24h | 30% | انخفاض = شراء، ارتفاع = بيع |
| RSI | 25% | < 30 = تشبع بيعي، > 70 = تشبع شرائي |
| الاتجاه | 20% | هابط = شراء، صاعد = بيع |
| الدعم/المقاومة | 15% | قرب الدعم = شراء، قرب المقاومة = بيع |
| الزخم | 10% | تعزيز الإشارة |

---

## 🔗 API Endpoints:

| Endpoint | الوصف |
|----------|-------|
| `GET /api/webhook` | Webhook للـ Telegram |
| `GET /api/analyze` | تحليل السوق (لـ UptimeRobot) |
| `GET /api/status` | حالة النظام |
| `GET /api/set-webhook` | ضبط الـ Webhook |

---

## 💻 التشغيل المحلي:

```bash
# استنساخ المستودع
git clone https://github.com/AliAlk88/Ali.git
cd Ali

# تثبيت المتطلبات
npm install

# إنشاء ملف .env
cp .env.example .env
# عدّل الملف وأضف التوكنات

# تشغيل Vercel محلياً
npm run vercel-dev

# أو تشغيل البوت مباشرة
npm start
```

---

## ⚠️ تنبيه

هذا البوت للأغراض التعليمية فقط. **ليس نصيحة مالية**. التداول ينطوي على مخاطر عالية.

---

## 👨‍💻 المطور

**Ali Alkhafajy**

[GitHub](https://github.com/AliAlk88)

---

*Version 2.1.0 - Vercel + Supabase Edition*
