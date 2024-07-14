const { Scenes: { BaseScene }, Markup } = require('telegraf');
const prisma = require('../prisma-client');

class SceneSetEmail {
  EmailScene() {
    const set = new BaseScene('set');
    set.enter(async (ctx) => {
      await ctx.reply('Введите, пожалуйста, Ваш email');
    });
    set.on('text', async (ctx) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const email = ctx.message.text;
      const telegramId = ctx.chat.id;

      if (ctx.message.text === '/start') {
        return ctx.scene.leave();
      }
      if (ctx.message.text === '/terminal') {
        return ctx.scene.leave();
      }
      if (ctx.message.text === '/notifications') {
        return ctx.scene.leave();
      }

      if (!emailRegex.test(email)) {
        await ctx.reply('Некорректный email');
        return ctx.scene.reenter();
      }

      try {
        const findUser = await prisma.m_User.findFirst({
          where: { email: email },
        });
        if (!findUser) {
          await ctx.reply(`Email ${email} в базе данных не найден. Попробуйте ввести корректный адрес или обратитесь в поддержку.`);
          return ctx.scene.reenter();
        }
        if (findUser.telegramId === telegramId) {
          await ctx.reply(`Ваш ТелеграммId уже сохранен в базе данных.`);
        } else {
          const updateUser = await prisma.m_User.update({
            where: { email: email },
            data: { telegramId: telegramId },
          });

          if (updateUser) {
            await ctx.reply(`Ваш ТелеграммId сохранен/обновлен в базе данных.`);
          } else {
            await ctx.reply(`Ошибка сохранения Телеграмм Id в базе данных.`);
          }
        }
        return ctx.scene.leave();
      } catch (error) {
        console.error('Database error:', error);
        await ctx.reply('Ошибка сохранения в базе данных. Попробуйте снова.');
        return ctx.scene.leave();
      }
    });

    set.on('message', async (ctx) => {
      await ctx.reply('Это явно не email');
      await ctx.scene.reenter();
    });

    return set;
  }
}

module.exports = SceneSetEmail