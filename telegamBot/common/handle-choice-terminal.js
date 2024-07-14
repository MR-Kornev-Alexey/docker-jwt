const { getObjectsByTelegramId } = require('../bd-client/get-objects-by-telegramId');
async function handleChoiceTerminal(ctx) {
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

module.exports = {handleChoiceTerminal}