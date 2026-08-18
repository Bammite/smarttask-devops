pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'bammite'
        APP_NAME        = 'smarttask'
        TARGET_BRANCH   = "${env.BRANCH_NAME ?: 'Dev'}"
        IMAGE_TAG       = "${env.TARGET_BRANCH}-${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Récupération du code depuis la branche ${env.TARGET_BRANCH}..."
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Construction de l'image Frontend..."
                sh "docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${IMAGE_TAG} ./frontend"

                echo "Construction de l'image Backend..."
                sh "docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-backend:${IMAGE_TAG} ./backend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "Connexion au Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'

                    echo "Publication de l'image Frontend..."
                    sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${IMAGE_TAG}"

                    echo "Publication de l'image Backend..."
                    sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}-backend:${IMAGE_TAG}"
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${IMAGE_TAG} || true"
            sh "docker rmi ${DOCKER_REGISTRY}/${APP_NAME}-backend:${IMAGE_TAG} || true"
        }
        success {
            echo "Pipeline terminé avec succès !"
        }
        failure {
            echo "Erreur lors de l'exécution du pipeline."
        }
    }
}
