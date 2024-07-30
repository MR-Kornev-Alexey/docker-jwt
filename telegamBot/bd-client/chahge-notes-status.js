const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Updates the telegramInfo status for a user based on their telegramId.
 * @param {string} chatId - The telegram ID of the user.
 * @param {boolean} status - The new status to set for telegramInfo.
 * @returns {Promise<object|null>} - Returns an error object or null if successful.
 */
async function updateNotesStatus(chatId, status) {
  try {
    const user = await prisma.m_User.findFirst({
      where: {
        telegramId: chatId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.m_User.update({
      where: {
        id: user.id,
      },
      data: {
        telegramInfo: status,
      },
    });

    return null; // No error
  } catch (error) {
    console.error('Error changing status:', error);
    return { error: error.message };
  }
}

async function setNotesStatus(chatId) {
  return await updateNotesStatus(chatId, true);
}

async function resetNotesStatus(chatId) {
  return await updateNotesStatus(chatId, false);
}

module.exports = {
  setNotesStatus,
  resetNotesStatus,
};

// Gracefully shut down the Prisma client when the Node.js process exits
process.on('exit', async () => {
  await prisma.$disconnect();
});
