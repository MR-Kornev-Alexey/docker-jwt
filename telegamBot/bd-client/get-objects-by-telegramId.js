const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getObjectsByTelegramId(telegramId) {
  try {
    const user = await prisma.m_User.findFirst({
      where: {
        telegramId: telegramId,
      },
      include: {
        organization: {
          include: {
            objects: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.organization.objects;
  } catch (error) {
    console.error('Error retrieving objects:', error);
    return { error: error.message };
  }
}

// Экспорт функции
module.exports = {
  getObjectsByTelegramId,
};
