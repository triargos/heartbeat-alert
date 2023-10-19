FROM node:stretch-slim

WORKDIR /app
# Clone the GitHub repository
RUN git clone https://github.com/triargos/heartbeat-alert.git .
# Copy environment variables
COPY .env .env
# Perform a clean install
RUN npm ci --omit=dev

# Generate prisma client
RUN npm run prisma-generate
# Generate SQLite
RUN npm run prisma-push

# Start the service
ENTRYPOINT ["npx", "ts-node", "src/index.ts"]