FROM node:21 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Debug: Check if Prisma client was generated
RUN ls -la node_modules/.prisma

FROM node:21

RUN mkdir -p /app/

WORKDIR /app/

# Copy files from the builder stage
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma

# Expose port
EXPOSE 8000

# Start the application
CMD [ "npm", "run", "start:prod" ]