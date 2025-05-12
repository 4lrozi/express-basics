# 1) Builder stage: install dev dependencies and compile
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install ALL deps (including dev)
COPY package*.json ./
RUN npm install

# Copy source and build (if you had a build step—for pure Node apps you can skip this)
COPY . .

# 2) Runtime stage: copy only what’s needed
FROM node:18-alpine AS runtime

WORKDIR /usr/src/app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built assets and source
COPY --from=builder /usr/src/app/index.js ./index.js
COPY --from=builder /usr/src/app/routes ./routes
COPY --from=builder /usr/src/app/db.js ./db.js
COPY --from=builder /usr/src/app/test ./test
COPY --from=builder /usr/src/app/migrations ./migrations
COPY --from=builder /usr/src/app/knexfile.js ./knexfile.js
COPY --from=builder /usr/src/app/seeds ./seeds

# Used just on local
# COPY --from=builder /usr/src/app/.env ./.env

# Expose API port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
