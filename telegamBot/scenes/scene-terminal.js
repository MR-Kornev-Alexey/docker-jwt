const { Scenes: { BaseScene }, Markup } = require('telegraf');
const { getObjectsByTelegramId } = require('../bd-client/get-objects-by-telegramId');

class SceneTerminal {
  terminalScene() {
    const terminal = new BaseScene('terminal');
    terminal.enter(async (ctx) => {
      await ctx.reply('Запустить терминал', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Старт', callback_data: 'start_terminal' },
            ],
          ],
        },
      });
    });

    terminal.action('start_terminal', async (ctx) => {
      ctx.answerCbQuery();
      await this.handleStartTerminal(ctx);
    });

    terminal.on('callback_query', async (ctx) => {
      const selectedObjectId = ctx.callbackQuery.data;
      ctx.answerCbQuery();
      const chatId = ctx.update.callback_query?.from?.id;
      const messageId = ctx.update.callback_query.message.message_id;
      await ctx.telegram.deleteMessage(chatId, messageId);
      await ctx.scene.enter('next', { selectedObjectId });
      await ctx.scene.leave();
    });

    terminal.on('text', async (ctx) => {
      await this.handleTextCommands(ctx);
    });

    terminal.on('message', async (ctx) => {
      await ctx.reply('Это явно не та команда');
      await ctx.scene.reenter();
    });

    return terminal;
  }

  async handleStartTerminal(ctx) {
    const chatId = ctx.update.callback_query?.from?.id;
    const messageId = ctx.update.callback_query.message.message_id;
    ctx.answerCbQuery();

    if (chatId) {
      try {
        const objects = await getObjectsByTelegramId(chatId);
        const keyboard = objects.map(obj => [{ text: `${obj.name} ${obj.address}`, callback_data: obj.id }]);

        await ctx.telegram.sendMessage(chatId, 'Выберите объект', {
          reply_markup: { inline_keyboard: keyboard },
        });
        await ctx.telegram.deleteMessage(chatId, messageId);
        // await ctx.scene.next();
      } catch (error) {
        console.error('Error sending message:', error);
        await ctx.telegram.deleteMessage(chatId, messageId);
        await ctx.telegram.sendMessage(chatId, 'Произошла ошибка при получении объектов.');
        await ctx.scene.reenter();
      }
    } else {
      await ctx.telegram.deleteMessage(chatId, messageId);
      await ctx.telegram.sendMessage(chatId, 'Что-то пошло не так. Повторите ввод');
      await ctx.scene.reenter();
    }
  }


  async handleTextCommands(ctx) {
    try {
      const text = ctx.message.text;
      if (['/start', '/terminal', '/notifications'].includes(text)) {
        return ctx.scene.leave();
      }
    } catch (error) {
      console.error('Error handling text commands:', error);
    }
  }
}

module.exports = SceneTerminal;
