# Use the latest LTS version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
RUN yarn install

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 2000

# Define the command to run your app
CMD ["yarn", "start"]