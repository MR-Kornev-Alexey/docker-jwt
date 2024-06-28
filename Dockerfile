
# Build stage
FROM node:22 as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy .env file to the working directory
COPY .env .env

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies with increased memory limit
RUN NODE_OPTIONS="--max-old-space-size=4096" npm install

# Generate Prisma client
RUN npx prisma generate

# Debug: Check if Prisma client was generated
RUN ls -la node_modules/.prisma/client

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Debug: Check if build was successful
RUN ls -la dist

# Final stage
FROM node:21

WORKDIR /app

# Copy files from the builder stage
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma

# Debug: Verify that Prisma client is included in the final image
RUN ls -la node_modules/.prisma/client

# Expose port
EXPOSE 8000

# Start the application
CMD [ "npm", "run", "start:prod" ]