# Use Node.js official image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "index.js"] 