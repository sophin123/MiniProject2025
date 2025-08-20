# Use the latest LTS version of Node.js
FROM node:22-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

RUN npm run build

# Nginx container
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port your app runs on
EXPOSE 80




