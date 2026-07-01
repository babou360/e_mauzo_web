# # Install dependencies
# FROM node:18-alpine AS deps
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --production=false

# # Build the app
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY . .
# COPY --from=deps /app/node_modules ./node_modules

# ARG NEXT_PUBLIC_HOST
# ENV NEXT_PUBLIC_HOST=$NEXT_PUBLIC_HOST
# RUN npm run build

# # Run the app
# FROM node:18-alpine AS runner
# WORKDIR /app

# ENV NODE_ENV=production

# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./

# EXPOSE 3001

# CMD ["npm", "run", "start"]

FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

# 👇 explicitly copy public FIRST
COPY public ./public

# then copy rest of app
COPY . .

RUN npm run build
