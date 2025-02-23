# Base stage for both development and production
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development
RUN npm install
COPY . .
RUN npm run generate
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
RUN npm install
COPY . .
RUN npm run generate
RUN npm run build

# Production stage
FROM base AS production
RUN npm install --production
COPY --from=builder /app/dist ./dist
RUN npm run generate
CMD ["npm", "start"]