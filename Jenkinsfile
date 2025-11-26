pipeline {
    agent any

    environment {
        // --- CREDENTIALS (Looking good!) ---
        NEXUS_CREDENTIALS_ID = 'nexus-credentials-sahilrandive' 
        SONAR_TOKEN_ID = 'sonar-token-sahilrandive'
        
        // --- REMOTE URLS ---
        SONAR_HOST_URL = 'http://sonarqube.imcc.com/'
        NEXUS_REGISTRY = 'nexus.imcc.com' 
        NEXUS_URL = 'http://nexus.imcc.com'
        NEXUS_REPO = 'docker-hosted'
        
        // --- CRITICAL FIX: UNIQUE APP NAME ---
        // I updated this to include your name so you have your own Docker image
        IMAGE_NAME = 'anti-react-app-sahilrandive'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv(installationName: 'SonarQube') { 
                    // I updated this line to use your unique ${IMAGE_NAME} variable
                    sh "npx sonarqube-scanner -Dsonar.projectKey=${IMAGE_NAME} -Dsonar.sources=src -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=\$SONAR_AUTH_TOKEN"
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    dockerImage = docker.build("${IMAGE_NAME}:${TAG}")
                }
            }
        }

        stage('Push to Nexus') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: NEXUS_CREDENTIALS_ID, usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        // Login to the registry
                        sh "docker login -u ${NEXUS_USER} -p ${NEXUS_PASS} ${NEXUS_REGISTRY}"
                        
                        // Tag the image
                        sh "docker tag ${IMAGE_NAME}:${TAG} ${NEXUS_REGISTRY}/repository/${NEXUS_REPO}/${IMAGE_NAME}:${TAG}"
                        
                        // Push the image
                        sh "docker push ${NEXUS_REGISTRY}/repository/${NEXUS_REPO}/${IMAGE_NAME}:${TAG}"
                    }
                }
            }
        }
    }
}