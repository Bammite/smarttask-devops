pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'bammite'
        APP_NAME        = 'smarttask'
        IMAGE_TAG       = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Récupération du code depuis la branche ${env.BRANCH_NAME}..."
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
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    
                    echo "Publication de l'image Frontend..."
                    sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${IMAGE_TAG}"
                    
                    echo "Publication de l'image Backend..."
                    sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}-backend:${IMAGE_TAG}"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline terminé avec succès ! Images publiées sur Docker Hub."
        }
        failure {
            echo "Erreur lors de l'exécution du pipeline. Vérifiez les logs."
        }
        always {
            sh "docker rmi ${DOCKER_REGISTRY}/${APP_NAME}-frontend:${IMAGE_TAG} || true"
            sh "docker rmi ${DOCKER_REGISTRY}/${APP_NAME}-backend:${IMAGE_TAG} || true"
        }
    }
}
