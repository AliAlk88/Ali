/**
 * ALI BRAIN CLOUD SYNC - Telegram Trading Bot
 * للتشغيل المحلي فقط
 *
 * @version 3.0.0
 * @author Ali Alkhafajy
 */

require('dotenv').config();
const { Telegraf } = require('telegraf');
const config = require('./config');
const { handleCommand, handleMessage } = require('./lib/bot');
const priceService = require('./services/priceService');

// إنشاء البوت
const botToken = process.env.BOT_TOKEN || config.telegram.botToken;

if (!botToken || botToken === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Error: BOT_TOKEN not set!');
    console.error('Please set BOT_TOKEN in environment or .env file');
    process.exit(1);
}

const bot = new Telegraf(botToken);

// ========== معالجات الأوامر ==========

bot.command('start', async (ctx) => {
    const response = await handleCommand('start', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('help', async (ctx) => {
    const response = await handleCommand('help', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('analyze', async (ctx) => {
    await ctx.reply('🔄 جاري التحليل...');
    const response = await handleCommand('analyze', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('price', async (ctx) => {
    await ctx.reply('🔄 جاري جلب الأسعار...');
    const response = await handleCommand('price', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('signal', async (ctx) => {
    const response = await handleCommand('signal', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('platforms', async (ctx) => {
    const response = await handleCommand('platforms', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('opportunities', async (ctx) => {
    await ctx.reply('🔍 جاري البحث عن الفرص...');
    const response = await handleCommand('opportunities', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('watchlist', async (ctx) => {
    const response = await handleCommand('watchlist', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

bot.command('status', async (ctx) => {
    const response = await handleCommand('status', ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

// معالجة الرسائل العادية
bot.on('text', async (ctx) => {
    const response = await handleMessage(ctx.message.text, ctx.from.id);
    await ctx.reply(response.text, { parse_mode: response.parse_mode });
});

// معالجة الأخطاء
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ حدث خطأ غير متوقع.');
});

// ========== تشغيل البوت ==========

async function startBot() {
    try {
        console.log('🤖 ALI BRAIN CLOUD SYNC Bot v3.0.0');
        console.log('🚀 Starting bot...');

        await bot.launch();
        console.log('✅ Bot started successfully!');
        console.log('📱 Send /start to begin');

        // تحديث الأسعار في الخلفية
        setInterval(async () => {
            try {
                await priceService.getAllMarketPrices();
            } catch (error) {
                console.error('Error updating prices:', error.message);
            }
        }, 60 * 1000); // كل دقيقة

    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        process.exit(1);
    }
}

// إيقاف البوت عند الإغلاق
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

startBot();
