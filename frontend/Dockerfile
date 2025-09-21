# Use a stable LTS version of Node.js
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Accept build-time arg for the React app base URL and export it as env
ARG REACT_APP_BASE_URL
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps (for compatibility)
RUN npm install --legacy-peer-deps

# Copy the rest of your application files
COPY . .

# Build the React app
RUN npm run build

# Nginx container (final stage)
FROM nginx:alpine

# Accept the same build arg in the final stage
ARG REACT_APP_BASE_URL
# Set it as an environment variable in the final image
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}

# Copy built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port your app runs on
EXPOSE 80