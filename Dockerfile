FROM node:21 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:21

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/new_migs"

EXPOSE 8000
CMD [ "npm", "run", "start:prod" ]
