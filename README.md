A project to share your files in between different devices connected within same local network.

I have not put this sites available publicly due to security issues.

For now I want this project to keep within local network

This project is built using react, nodes, mysql, nginx and docker

<h1>Pre-requisite</h1>
Make sure you have docker installed on your machine.
You can follow docker official guide to install docker

For ubuntu -> https://docs.docker.com/engine/install/ubuntu/
For windows or mac -> simply download docker desktop

<h1> Steps </h1>

1. git clone project url with branch file-sharing

```
git clone -b file-sharing https://github.com/sophin123/MiniProject2025
```

2. Create .env.development and .env.production file in  your root directory.

```
touch .env.development
touch .env.production
```

3. Paste the following with the details in your .env.development

```
# Development Environment Configuration

# Database Configuration
MYSQL_HOST=mysql
MYSQL_USER=yourusername
MYSQL_PASSWORD=yourpassword
MYSQL_ROOT_PASSWORD=yourrootpassword
MYSQL_DATABASE=fileshare


# Application Configuration
NODE_ENV=development
PORT=2000
MAX_FILE_SIZE=20971520

# Frontend Configuration
REACT_APP_BASE_URL=http://localhost:2000/api
REACT_APP_ENV=development

# Security (Development only - use weak passwords for local dev)
JWT_SECRET=yoursecretkey

# File Upload Configuration
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_GB=3

```

4. Paste the following with the details in your .env.production

```
# Production Environment Configuration

# Database Configuration
MYSQL_HOST=mysql
MYSQL_USER=yourusername
MYSQL_PASSWORD=yourpassword
MYSQL_ROOT_PASSWORD=yourrootpassword
MYSQL_DATABASE=fileshare

# Application Configuration
NODE_ENV=production
PORT=2000

# Frontend Configuration
REACT_APP_BASE_URL=/api
REACT_APP_ENV=production

# Security (Use strong, unique passwords in production)
JWT_SECRET=yoursecretkey

# File Upload Configuration
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_GB=3

```

5. To run project for development purpose. 
```
docker-compose --env-file .env.development -f docker-compose.dev.yml up -d --build
```

6. To run project for production purpose. Make sure you have published your build image in docker hub and configure on docker-compose.prod.yml
For eg:
backend:
    image: sophin/fileshare-backend:v1.0.2

7. Run the following command. It will download the image and run them

```
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

8. To access your sites, 
In windows and mac, you can basically use your nginx ports for eg: localhost:80 
For ubuntu and vmware, you need to forward port or you can use your host ip address with 80 port. For eg 192.168.0.24:80