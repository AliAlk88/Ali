/**
 * Vercel Deployment Script
 * سكريبت النشر التلقائي على Vercel
 *
 * الاستخدام:
 * node deploy.js VERCEL_TOKEN
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// قراءة التوكن من سطر الأوامر
const VERCEL_TOKEN = process.argv[2] || process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN required!');
    console.error('Usage: node deploy.js YOUR_VERCEL_TOKEN');
    console.error('');
    console.error('Get your token from: https://vercel.com/account/tokens');
    process.exit(1);
}

// إعدادات النشر
const PROJECT_NAME = 'ali-brain-telegram-bot';
const DEPLOY_CONFIG = {
    name: PROJECT_NAME,
    version: 2,
    builds: [
        { src: 'api/**/*.js', use: '@vercel/node' }
    ],
    routes: [
        { src: '/api/webhook', dest: '/api/webhook.js' },
        { src: '/api/analyze', dest: '/api/analyze.js' },
        { src: '/api/status', dest: '/api/status.js' },
        { src: '/api/set-webhook', dest: '/api/set-webhook.js' }
    ],
    env: {
        BOT_TOKEN: '@bot_token',
        SUPABASE_URL: '@supabase_url',
        SUPABASE_ANON_KEY: '@supabase_anon_key'
    }
};

async function deploy() {
    console.log('🚀 Starting Vercel deployment...');
    console.log(`📦 Project: ${PROJECT_NAME}`);

    try {
        // استخدام Vercel CLI
        const command = `npx vercel --token "${VERCEL_TOKEN}" --prod --yes`;

        console.log('⏳ Deploying...');
        const output = execSync(command, {
            encoding: 'utf-8',
            cwd: __dirname,
            env: {
                ...process.env,
                VERCEL_TOKEN: VERCEL_TOKEN
            }
        });

        console.log('✅ Deployment successful!');
        console.log(output);

        // استخراج رابط النشر
        const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
            const deployUrl = urlMatch[0];
            console.log(`\n🌐 Deployment URL: ${deployUrl}`);
            console.log(`📡 Webhook URL: ${deployUrl}/api/webhook`);
            console.log(`\n🔗 Set webhook: ${deployUrl}/api/set-webhook`);
        }

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);

        if (error.message.includes('No existing credentials')) {
            console.log('\n💡 Please provide a valid Vercel token:');
            console.log('   Get it from: https://vercel.com/account/tokens');
        }
    }
}

// تشغيل النشر
deploy();
