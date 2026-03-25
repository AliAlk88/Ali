/**
 * Webhook Handler - Vercel Serverless Function
 * يستقبل التحديثات من Telegram
 */

const { Telegraf } = require('telegraf');
const { handleCommand, handleMessage } = require('../lib/bot');

// إنشاء البوت
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  console.error('❌ BOT_TOKEN not set!');
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
});

/**
 * Vercel Serverless Function Handler
 */
module.exports = async function handler(req, res) {
  // التحقق من طريقة الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // معالجة التحديث من Telegram
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
