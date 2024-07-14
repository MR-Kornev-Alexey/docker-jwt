const { Scenes: { BaseScene } } = require('telegraf');
const { handleChoiceTerminal } = require('../common/handle-choice-terminal');
const { getNoteFromAPI } = require('../bd-client/get-note-from-bd');
const convertFormatData = require('../common/convert-format-data');

class NoteScene {
  noteScene() {
    const note = new BaseScene('note');
    note.enter(async (ctx) => {
      await ctx.reply('Загрузка уведомлений', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Загрузить', callback_data: 'start_note' }
            ],
          ],
        },
      });
    });

    note.action('start_note', async (ctx) => {
      ctx.answerCbQuery()
      await handleChoiceTerminal(ctx)
    });

    note.on('callback_query', async (ctx) => {
      const selectedObjectId = ctx.callbackQuery.data;
      ctx.answerCbQuery()
      const chatId = ctx.update.callback_query?.from?.id;
      const messageId = ctx.update.callback_query.message.message_id;
      await ctx.telegram.deleteMessage(chatId, messageId);
      const notes = await getNoteFromAPI(selectedObjectId)
      if(notes.length > 0) {
        for (let i = 0; i < notes.length; i++) {
          await ctx.reply(`${convertFormatData(notes[i].created_at)}\n${notes[i].information}`)
        }
        return ctx.scene.leave();
      } else {
        await ctx.reply('По данному объекту нет уведомлений')
        return ctx.scene.leave();
      }
    });
    return note;
  }
}

module.exports = NoteScene;
