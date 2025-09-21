pipeline {
    agent { label 'agent1' }
    
    environment {
        DOCKER_HUB_USER = "sophin"
        FRONTEND_IMAGE = "fileshare-frontend"
        BACKEND_IMAGE = "fileshare-backend"
        VERSION = "v1.0.2"   // later you can automate versioning
    }

    // stages {
    //     stage('Check Docker Version') {
    //         steps {
    //             sh 'docker --version'
    //         }
    //     }
    // }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'file-sharing', url: 'https://github.com/sophin123/MiniProject2025'
            }
        }

        // stage('Check Docker Permission'){
        //     steps {
        //         sh 'exit'
        //         sh 'getent group docker'
        //         sh 'whoami'
        //         sh 'ls -l /var/run/docker.sock'
        //         sh 'docker ps -a'
        //     }
        // }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose -f docker-compose.dev.yml build'
            }
        }

        stage('Tag Images') {
            steps {
                sh """
                    docker tag ${FRONTEND_IMAGE}:latest ${DOCKER_HUB_USER}/${FRONTEND_IMAGE}:${VERSION}
                    docker tag ${BACKEND_IMAGE}:latest ${DOCKER_HUB_USER}/${BACKEND_IMAGE}:${VERSION}
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh """
                    docker push ${DOCKER_HUB_USER}/${FRONTEND_IMAGE}:${VERSION}
                    docker push ${DOCKER_HUB_USER}/${BACKEND_IMAGE}:${VERSION}
                """
            }
        }
    }
}
