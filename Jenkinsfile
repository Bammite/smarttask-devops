pipeline {
    agent any

    environment {
        
        def dockerRegistry = 'bammite' 
        def appName = 'smarttask'
        def imageTag = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}" // Ex: Dev-5 ou Prod-12
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
                sh "docker build -t ${dockerRegistry}/${appName}-frontend:${imageTag} ./frontend"
                
                echo "Construction de l'image Backend..."
                sh "docker build -t ${dockerRegistry}/${appName}-backend:${imageTag} ./backend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "Connexion au Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    
                    echo "Publication de l'image Frontend..."
                    sh "docker push ${dockerRegistry}/${appName}-frontend:${imageTag}"
                    
                    echo "Publication de l'image Backend..."
                    sh "docker push ${dockerRegistry}/${appName}-backend:${imageTag}"
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
            // Nettoyage des images locales pour libérer de la place
            sh "docker rmi ${dockerRegistry}/${appName}-frontend:${imageTag} || true"
            sh "docker rmi ${dockerRegistry}/${appName}-backend:${imageTag} || true"
        }
    }
}
