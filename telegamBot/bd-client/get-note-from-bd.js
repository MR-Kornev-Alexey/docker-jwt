

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getNoteFromAPI(objectID) {
  try {
    const notes = await prisma.m_notifications.findMany({
      where: {
        object_id: objectID,
      }
    });

    if (!notes) {
      throw new Error('info not found');
    }

    return notes
  } catch (error) {
    console.error('Error retrieving notes:', error);
    return { error: error.message };
  }
}

// Экспорт функции
module.exports = {
  getNoteFromAPI
};
