# Используем node:22 как базовый образ
FROM node:21 AS builder

# Устанавливаем рабочую директорию /app
WORKDIR /app

# Копируем .env файл
COPY .env ./

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm install --only=prod

# Копируем все файлы проекта
COPY . .

# Собираем проект с помощью Nest CLI
RUN npm run build

# Второй этап Dockerfile
FROM node:21

# Создаем директорию /app в контейнере
RUN mkdir -p /app

# Устанавливаем рабочую директорию /app
WORKDIR /app

# Копируем зависимости и собранные файлы из предыдущего этапа
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma

# Ваша подсказка
EXPOSE 8000

# Команда для запуска приложения в продакшн режиме
CMD [ "npm", "run", "start:prod" ]
