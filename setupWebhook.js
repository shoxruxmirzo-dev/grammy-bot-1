const { Bot } = require('grammy');
require('dotenv').config();

const bot = new Bot(process.env.BOT_API_TOKEN);

async function setupWebhook() {
  try {
    await bot.api.setWebhook(process.env.WEBHOOK_URL);
    console.log('✅ Webhook установлен:', process.env.WEBHOOK_URL);

    const info = await bot.api.getWebhookInfo();
    console.log('ℹ️ Информация о webhook:', info);
  } catch (err) {
    console.error('❌ Ошибка при установке webhook:', err);
  }
}

setupWebhook();
