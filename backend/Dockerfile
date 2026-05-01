# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
# Note: bcryptjs is used, which is pure JS and works perfectly on Alpine without build tools
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 600000

# Set environment variables (these should ideally be provided at runtime via docker-compose or K8s)
ENV PORT=5000
ENV NODE_ENV=production

# Start the application
# We run initDb.js first to ensure tables exist, then start the server
CMD ["sh", "-c", "node initDb.js && node server.js"]
