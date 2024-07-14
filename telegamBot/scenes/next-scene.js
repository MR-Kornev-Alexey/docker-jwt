const { Scenes: { BaseScene } } = require('telegraf');
const { startInterval, stopInterval } = require('../bd-client/send-data-to-terminal');
const { getAllSensorsFromAPI } = require('../bd-client/get-all-sensors-from-bd');

class NextScene {
  nextScene() {
    const next = new BaseScene('next');

    next.command('/stop', async (ctx) => {
      stopInterval();
      await ctx.reply('Терминал остановлен');
      await ctx.scene.leave();
    });

    next.enter(async (ctx) => {
      try {
        const selectedObjectId = ctx.scene.state.selectedObjectId;
        const sensors = await getAllSensorsFromAPI(selectedObjectId);
        const activeSensors = sensors.filter(sensor => sensor.run).map(sensor => sensor.id);
        if(activeSensors.length > 0) {
          console.log('activeSensors ', activeSensors);
          const delayBetweenRequests = 10000; // 12 секунд
          await startInterval(activeSensors, delayBetweenRequests, (result) => {
            console.log('Received result:', result?.request_code);
            ctx.reply(`Код запроса: ${result?.request_code}\nОтвет: ${result?.answer_code}`)
          });
          await ctx.reply('Терминал запущен. Используйте команду /stop для остановки.');
        } else {
          await ctx.reply('Для данного объекта нет активных датчиков.');
          await ctx.scene.leave();
        }
      } catch (error) {
        console.error('Error in next.enter:', error);
        await ctx.reply('Произошла ошибка при выполнении операции');
        await ctx.scene.reenter();
      }
    });
    return next;
  }
}

module.exports = NextScene;
