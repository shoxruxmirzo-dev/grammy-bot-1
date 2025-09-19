const { Bot } = require('grammy');
require('dotenv').config();

const bot = new Bot(process.env.BOT_API_TOKEN);

async function deleteWebhook() {
  try {
    await bot.api.deleteWebhook();
    console.log('🗑 Webhook удалён. Теперь можно использовать polling.');
  } catch (err) {
    console.error('❌ Ошибка при удалении webhook:', err);
  }
}

deleteWebhook();
