/**
 * Set Webhook API - لضبط الـ webhook على Telegram
 * يجب استدعاؤه مرة واحدة بعد النشر
 */

const { Telegraf } = require('telegraf');

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({
      success: false,
      error: 'BOT_TOKEN not configured'
    });
  }

  try {
    // الحصول على رابط الـ webhook من الطلب أو استخدام الرابط الافتراضي
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const webhookUrl = `${protocol}://${host}/api/webhook`;

    // ضبط الـ webhook
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      }
    );

    const result = await response.json();

    if (result.ok) {
      return res.status(200).json({
        success: true,
        message: 'Webhook set successfully',
        webhookUrl: webhookUrl,
        telegramResponse: result
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to set webhook',
        telegramResponse: result
      });
    }
  } catch (error) {
    console.error('Set webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
