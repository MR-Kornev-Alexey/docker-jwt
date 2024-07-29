const { Scenes: { BaseScene } } = require('telegraf');
const { startInterval, stopInterval } = require('../bd-client/send-data-to-terminal');
const { getAllSensorsFromAPI } = require('../bd-client/get-all-sensors-from-bd');

class NextScene {
  constructor() {
    this.activeSensors = []; // Initialize activeSensors here
    this.shouldStop = false; // Control flag for stopping
  }

  nextScene() {
    const next = new BaseScene('next');

    next.enter(async (ctx) => {
      try {
        const selectedObjectId = ctx.scene.state.selectedObjectId;
        const sensors = await getAllSensorsFromAPI(selectedObjectId);
        this.activeSensors = sensors.filter(sensor => sensor.run).map(sensor => sensor.id); // Set activeSensors

        if (this.activeSensors.length > 0) {
          console.log('activeSensors ', this.activeSensors);
          const delayBetweenRequests = 10000; // 10 seconds
          await ctx.reply('Терминал запущен. Используйте команду /stop для остановки.');

          const restartInterval = async () => {
            if (this.shouldStop) {
              console.log('Interval restart.');
              return; // Exit if shouldStop is true
            }
            const stopInterval = async () => {
              console.log('Interval stopped.');
              await ctx.scene.leave();
            };

            await startInterval(this.activeSensors, delayBetweenRequests, (result) => {
                console.log('Request:', result?.request_code);
                console.log(new Date());
                ctx.reply(`Код запроса: ${result?.request_code}\nОтвет: ${result?.answer_code}`);
              }, () => {
                // When the cycle completes, check if we still have active sensors
                if (!this.shouldStop && this.activeSensors.length > 0) {
                  console.log('Cycle complete. Restarting...');
                  restartInterval(); // Restart if not stopped
                }
              }, async () => {
                await stopInterval();
                await ctx.scene.leave();
              },
            );
          };

          // Start the first interval cycle
          await restartInterval();
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
