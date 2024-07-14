const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTerminalRequest(sensorId) {
  try {
    return await prisma.dataFromSensor.findFirst({
      where: {
        sensor_id: sensorId,
      },
      orderBy: {
        created_at: 'desc', // Сортировка по полю created_at в убывающем порядке
      },
    });
  } catch (error) {
    console.error('Произошла ошибка:', error.message);
    return { error: error.message };
  }
}


let intervalId = null; // Переменная для хранения идентификатора интервала

async function startInterval(sensorsArray, delay, callback) {
  try {
    intervalId = setInterval(async () => {
      for (let i = 0; i < sensorsArray.length; i++) {
        const sensorId = sensorsArray[i];
        const response = await getTerminalRequest(sensorId);
        if (callback) {
          callback(response);
        }
      }
    }, delay);
  } catch (error) {
    console.error('Error during interval processing:', error);
    // Перебросить ошибку для обработки снаружи, если нужно
    throw error;
  }
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = { startInterval, stopInterval };
