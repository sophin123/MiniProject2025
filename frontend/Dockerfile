FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Install dependencies

# Make sure to copy yarn.lock as well as it is used to ensure consistent installs if missed you will get
# [ERROR] Cannot start service: Host version "0.25.5" does not match binary version "0.25.

COPY package.json yarn.lock ./


RUN yarn install --frozen-lockfile

# Copy app source
COPY . .

# Expose Vite's default port
# EXPOSE 5173

# CMD ["yarn", "dev", "--host"]

# Uncomment below lines to build the app and serve it with nginx for ubuntu

# Build the app
RUN yarn build

# Stage 2: Serve the app using nginx
FROM nginx:alpine

# Copy build output to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]