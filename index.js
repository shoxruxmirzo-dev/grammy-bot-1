const express = require('express');
const {
  Bot,
  webhookCallback,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require('grammy');
const { getRandomQuestion, getCorrectAnswer } = require('./utils.js');
require('dotenv').config();

const bot = new Bot(process.env.BOT_API_TOKEN);

bot.command('start', async (ctx) => {
  const startKB = new Keyboard()
    .text('HTML')
    .text('CSS')
    .row()
    .text('JavaScript')
    .text('React')
    .row()
    .text('Случайный вопрос')
    .resized();
  await ctx.reply(
    'Привет! Я - Фронтенд интервью бот 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду'
  );
  await ctx.reply('С чего начнем? Выбери тему вопроса в меню 👇', {
    reply_markup: startKB,
  });
});

bot.hears(['HTML', 'CSS', 'JavaScript', 'React', 'Случайный вопрос'], async (ctx) => {
  const topic = ctx.message.text.toLowerCase();
  const { question, questionTopic } = getRandomQuestion(topic);

  let inlineKB;

  if (question.hasOptions) {
    const buttonRows = question.options.map((option) => [
      InlineKeyboard.text(
        option.text,
        JSON.stringify({
          questionId: question.id,
          type: `${questionTopic}-option`,
          isCorrect: option.isCorrect,
        })
      ),
    ]);

    inlineKB = InlineKeyboard.from(buttonRows);
  } else {
    inlineKB = new InlineKeyboard().text(
      'Узнать ответ',
      JSON.stringify({
        questionId: question.id,
        type: questionTopic,
      })
    );
  }

  await ctx.reply(question.text, {
    reply_markup: inlineKB,
  });
});

bot.on('callback_query:data', async (ctx) => {
  const callBackData = JSON.parse(ctx.callbackQuery.data);
  if (!callBackData.type.includes('option')) {
    const answer = getCorrectAnswer(callBackData.type, callBackData.questionId);
    await ctx.reply(answer, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    await ctx.answerCallbackQuery();
    return;
  }

  if (callBackData.isCorrect) {
    await ctx.reply('Верно ✅');
    await ctx.answerCallbackQuery();
    return;
  }

  const answer = getCorrectAnswer(callBackData.type.split('-')[0], callBackData.questionId);
  await ctx.reply(`Неверно ❌ Правильный ответ: ${answer}`);
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Ошибка в запросе:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Не удалось связаться с Telegram:', e);
  } else {
    console.error('Неизвестная ошибка:', e);
  }
});

// Проверка окружения
if (process.env.NODE_ENV === 'production') {
  // Railway = webhook
  const app = express();

  // Webhook middleware от grammy
  app.use(express.json());
  app.use('/webhook', webhookCallback(bot, 'express'));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`✅ Webhook сервер запущен на порту ${port}`);
  });
} else {
  // Локально = polling
  bot.start();
  console.log('✅ Бот запущен локально через polling');
}
