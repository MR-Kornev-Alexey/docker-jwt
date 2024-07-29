const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTerminalRequest(sensorId) {
  try {
    return await prisma.dataFromSensor.findFirst({
      where: {
        sensor_id: sensorId,
      },
      orderBy: {
        created_at: 'desc', // Sort by created_at in descending order
      },
    });
  } catch (error) {
    console.error('Error occurred:', error.message);
    return { error: error.message };
  }
}

let shouldStop = false; // Control variable to manage stopping

async function stopInterval() {
  console.log("stopInterval...")
  shouldStop = true; // Set the flag to true to stop the interval
}

async function newStartInterval() {
  console.log("newStartInterval...")
  shouldStop = false; // Set the flag to true to stop the interval
}
async function startInterval(sensorsArray, delay, callback, completionCallback, stopCallback) {
  try {
    for (const sensorId of sensorsArray) {
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait for the specified delay
      const response = await getTerminalRequest(sensorId); // Fetch data for the sensor
      if (shouldStop) {
        stopCallback()
      } else {
        if (callback) {
          callback(response); // Invoke the callback with the response
        }
      }
    }
    if (shouldStop) {
      stopCallback()
    } else {
      if (completionCallback) {
        completionCallback(); // Call the completion callback if provided
      }
    }
  } catch (error) {
    console.error('Error during interval processing:', error);
    throw error; // Rethrow the error for external handling if needed
  }
}


module.exports = { startInterval, stopInterval, newStartInterval};
