const { Telegraf, Scenes, session, Markup } = require('telegraf');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Initialize the Telegraf bot with the token
const token = '7493939483:AAGWJGDmU0hSYlg2jYyUKXUqTPGMge62wgM';
const bot = new Telegraf(token);

// Define your scenes
const SceneTerminal = require('./scenes/scene-terminal');
const SceneSetEmail = require('./scenes/scene-email');
const NextScene = require('./scenes/next-scene');
const NoteScene = require('./scenes/note-scene');
const { stopInterval, resetInterval, newStartInterval } = require('./bd-client/send-data-to-terminal');

const setTelegramID = new SceneSetEmail().EmailScene();
const terminalScene = new SceneTerminal().terminalScene();
const nextScene = new NextScene().nextScene();
const noteScene = new NoteScene().noteScene();

const stage = new Scenes.Stage([setTelegramID, terminalScene, nextScene, noteScene]);
bot.use(session());
bot.use(stage.middleware());

// Define the /start command
bot.start(async (ctx) => {
  await ctx.replyWithHTML(
    `<b>Добрый день ${ctx?.message?.from?.first_name || 'незнакомец'}!</b>\nПриветствую Вас в KisBot.\nВыберите в меню соответствующую команду`,
    Markup.keyboard([
      ['Терминал', 'Уведомления'] // Keyboard buttons
    ]).resize().oneTime()
  );
});

// Define other commands
bot.command('email', async (ctx) => {
  await ctx.scene.enter('set');
});

bot.command('terminal', async (ctx) => {
  await stopInterval();
  await ctx.scene.enter('terminal');
});

bot.command('notifications', async (ctx) => {
  await ctx.scene.enter('note');
});

bot.command('stop', async (ctx) => {
  await stopInterval();
  ctx.reply(`Остановка терминала`);
  await ctx.scene.leave();
});

// Handle text messages
bot.on('text', async (ctx) => {
  if (ctx.message.text === 'Терминал') {
    await ctx.scene.enter('terminal');
  } else if (ctx.message.text === 'Уведомления') {
    await ctx.scene.enter('note');
  } else {
    await ctx.reply('Введенная команда не определена');
  }
});

// Define the /message endpoint in Express
app.post('/message', async (req, res) => {
  const { chatId, message } = req.body;
  console.log('req.body === ', req.body);
  try {
    await bot.telegram.sendMessage(chatId, message);
    res.status(200).json({ status: 'success', message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message' });
  }
});

// Assuming `bot` and `message` are defined earlier in the code
app.get('/send', async (req, res) => {
  // Extracting chatId and message from the query parameters
  const chatId = req.query.chatId;
  const message = req.query.message; // Ensure message is passed as a query parameter

  // Check if chatId and message are provided
  if (!chatId || !message) {
    return res.status(400).json({ status: 'error', message: 'chatId and message are required' });
  }

  try {
    // Sending the message using bot.telegram.sendMessage
    await bot.telegram.sendMessage(chatId, message);
    res.status(200).json({ status: 'success', message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message' });
  }
});

// Start the Express server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);

  // Launch the bot after the server has started
  bot.launch()
    .then(() => console.log('Bot is running'))
    .catch(err => console.error('Error launching bot:', err));
});

// start - Старт бота
// email - Регистрация
// terminal - Терминал
// stop - Остановка терминала
// start_alarm - Старт оповещения
// stop_alarm  - Стоп оповещения
// notifications - Уведомления




// const token = '7493939483:AAGWJGDmU0hSYlg2jYyUKXUqTPGMge62wgM';