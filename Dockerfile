FROM node:21 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:21

RUN mkdir -p /app/

WORKDIR /app/

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma
npx prisma generate
# Подсказка, не влияет на реальную работу
EXPOSE 8000
CMD [ "npm", "run", "start:prod" ]
