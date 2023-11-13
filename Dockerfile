FROM node:slim

WORKDIR /app
# Clone the GitHub repository
COPY . .
# Copy environment variables
RUN echo "DATABASE_URL=file:./dev.db" >> ".env"

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl
# Perform a clean install
RUN npm ci --omit=dev

# Generate prisma client
RUN npm run prisma-generate
# Generate SQLite
RUN npm run prisma-push

# Start the service
ENTRYPOINT ["npx", "ts-node", "src/index.ts"]