
# Dockerfile for Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy our custom configuration
COPY nginx.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]