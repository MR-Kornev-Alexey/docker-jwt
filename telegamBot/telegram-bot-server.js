
const { Telegraf, Scenes, session, Markup } = require('telegraf');

const token = '7493939483:AAGWJGDmU0hSYlg2jYyUKXUqTPGMge62wgM';
const bot = new Telegraf(token);
const SceneTerminal = require('./scenes/scene-terminal');
const SceneSetEmail = require('./scenes/scene-email');
const NextScene = require('./scenes/next-scene');
const NoteScene = require('./scenes/note-scene');
const { stopInterval } = require('./bd-client/send-data-to-terminal');
const setTelegramID = new SceneSetEmail().EmailScene();
const terminalScene = new SceneTerminal().terminalScene();
const nextScene = new NextScene().nextScene();
const noteScene = new NoteScene().noteScene();

const stage = new Scenes.Stage([setTelegramID, terminalScene, nextScene, noteScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.replyWithHTML(
    `<b>Добрый день ${ctx?.message?.from?.first_name ? ctx.message?.from?.first_name : 'незнакомец'}!</b>\nПриветствую Вас в KisBot.\nВыберите в меню соответствующую команду`,
    Markup.keyboard([
      ['Терминал', 'Уведомления'] // Кнопка для остановки
    ]).resize().oneTime()
  );
});

bot.command('email', async (ctx) => {
  await ctx.scene.enter('set');
});
bot.command('terminal', async (ctx) => {
  await ctx.scene.enter('terminal');
});
bot.command('notifications', async (ctx) => {
  await ctx.scene.enter('note');
});
bot.command('stop', async (ctx) => {
  // Останавливаем интервал
  stopInterval();
  // Выходим из текущей сцены
  await ctx.scene.leave();
  // Уведомляем пользователя
  await ctx.reply('Терминал остановлен');
});
bot.on('text', async (ctx) => {
  if (ctx.message.text === 'Терминал') {
    await ctx.scene.enter('terminal');
  }else
  if (ctx.message.text === 'Уведомления') {
    await ctx.scene.enter('note');
  }
  else {
    await ctx.reply('Введенная команда не определена')
  }
});

bot.launch()
  .then(() => console.log('Bot is running'))
  .catch(err => console.error('Error launching bot:', err));
