FROM node:slim

WORKDIR /app
# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

# Clone the GitHub repository
COPY . .
# Copy environment variables
RUN echo "DATABASE_URL=file:./dev.db" >> ".env"

# Perform a clean install
RUN npm ci

# Generate client definitions
RUN npm run prisma-generate

# Build the project
RUN npm run build

# Push SQLite
RUN npm run prisma-push

# Start the service
ENTRYPOINT ["npm", "run", "start"]