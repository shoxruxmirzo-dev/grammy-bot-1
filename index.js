require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const { getRandomQuestion } = require('./utils.js');

const bot = new Bot(process.env.BOT_API_TOKEN);

bot.command('start', async (ctx) => {
  const startKB = new Keyboard().text('HTML').text('CSS').row().text('JS').text('React').resized();
  await ctx.reply(
    'Привет! Я - Фронтенд интервью бот 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду'
  );
  await ctx.reply('С чего начнем? Выбери тему вопроса в меню 👇', {
    reply_markup: startKB,
  });
});

bot.hears(['HTML', 'CSS', 'JS', 'React'], async (ctx) => {
  const topic = ctx.message.text;
  const question = getRandomQuestion(topic);
  const inlineKB = new InlineKeyboard()
    .text(
      'Узнать ответ',
      JSON.stringify({
        question_id: question.id,
        type: ctx.message.text,
      })
    )
    .text('Отменить', 'cancel');
  await ctx.reply(question.text, {
    reply_markup: inlineKB,
  });
});

bot.on('callback_query:data', async (ctx) => {
  if (ctx.callbackQuery.data === 'cancel') {
    await ctx.reply('Отменено');
    await ctx.answerCallbackQuery();
    return;
  }

  const CBData = JSON.parse(ctx.callbackQuery.data);
  await ctx.reply(`${CBData.type} - составляющая фронтенда`);
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

bot.start();
