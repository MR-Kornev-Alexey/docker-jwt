# First stage: build stage
FROM node:21 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy .env file to the working directory
COPY .env ./

# Copy Prisma schema directory
COPY prisma ./prisma/

# Set the memory limit for Node.js (adjust as needed)
ENV NODE_OPTIONS=--max-old-space-size=1024

# Clean npm cache and install dependencies
RUN npm cache clean --force && npm install

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Generate Prisma client
RUN npx prisma generate

# Debugging: Check if Prisma client was generated
RUN ls -la node_modules/.prisma/client

# Copy the entire application source code
COPY . .

# Build the application
RUN npm run build

# Debugging: Check if build was successful
RUN ls -la dist
