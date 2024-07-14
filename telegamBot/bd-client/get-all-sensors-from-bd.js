const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllSensorsFromAPI(objectID) {
  try {
    const sensors = await prisma.m_Object.findFirst({
      where: {
        id: objectID,
      },
      include: {
        Sensor: true
      },
    });
    if (!sensors) {
      throw new Error('Sensors not found');
    }
    return sensors.Sensor;
  } catch (error) {
    console.error('Error retrieving objects:', error);
    return { error: error.message };
  }
}

// Экспорт функции
module.exports = {
  getAllSensorsFromAPI,
};
