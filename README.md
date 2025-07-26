A project to share your files in between different devices connected within same local network.

I have not put this sites available publicly due to security issues.

For now I want this project to keep within local network

This project is built using nodes js, mysql, nginx and react

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

2. Make sure you are in file-sharing directory. Create new .env

```
touch .env
```

3. Paste the following with the details in your .env you want to configure your mysql with

```
MYSQL_HOST=testhost
MYSQL_USER=testuser
MYSQL_PASSWORD=testpassword
MYSQL_ROOT_PASSWORD=testrootpassword
MYSQL_DATABASE=testdatabase
```

2. cd to frontend and create two files

```
touch .env.development .env.production
```

3. Paste the following

```
REACT_APP_BASE_URL=http://localhost:2000/api
# Paste this in .env.development
or run the command
echo "REACT_APP_BASE_URL=http://localhost:2000/api" >> .env.development

REACT_APP_BASE_URL=/api
# Paste this in .env.production
or run the command
echo "REACT_APP_BASE_URL=/api" >> .env.production

```

4. go back to your root directory i.e file-sharing
5. Based on your environment you are using copy docker-compose-\*.yml to your docker-compose.yml as config is bit different on mac, win and linux due to network configuration.

6. Run following command

```
docker compose up
```

<h1>Run them locally instead of running them in docker </h1>

To run this project locally, make sure you have mysql running and also make sure you created a new user with localhost as domain and give access to fileshare database or more easy all database _._ .
for eg: 'username'@'localhost'

1. git clone project url with branch file-sharing
2. cd backend
3. create file

```
touch .env
```

4. Paste the following with the details in your .env you want to configure your mysql with

```
MYSQL_HOST=testhost
MYSQL_USER=testuser
MYSQL_PASSWORD=testpassword
MYSQL_ROOT_PASSWORD=testrootpassword
MYSQL_DATABASE=testdatabase
```

5. npm install
6. npm start
7. cd frontend
8. create two .env files

```
touch .env.development .env.production
```

9. Paste the following

```
REACT_APP_BASE_URL=http://localhost:2000/api
# Paste this in .env.development

REACT_APP_BASE_URL=/api
# Paste this in .env.production
```

10. npm install
11. npm start

Note: If you have issues connecting to mysql, make sure the database called fileshare already exist or create new one if not.
