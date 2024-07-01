# Stage 1: Build stage
FROM node:22 AS builder

WORKDIR /app

COPY .env ./
COPY package*.json ./
COPY prisma ./prisma/

# Install global dependencies first
RUN npm install -g @nestjs/cli

# Install project dependencies
RUN npm install

COPY . .

# Build the project using the global nest CLI
RUN nest build

# Stage 2: Production stage
FROM node:22

WORKDIR /app/

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma

# Expose the application port
EXPOSE 8000

CMD [ "npm", "run", "start:prod" ]
