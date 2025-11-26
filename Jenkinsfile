pipeline {
    agent any

    environment {
        // --- CREDENTIALS ---
        NEXUS_CREDENTIALS_ID = 'nexus-credentials-sahilrandive' 
        SONAR_TOKEN_ID = 'sonar-token-sahilrandive'
        
        // --- CONFIGURATION ---
        SONAR_HOST_URL = 'http://sonarqube.imcc.com/'
        NEXUS_REGISTRY = 'nexus.imcc.com' 
        NEXUS_REPO = 'docker-hosted'
        
        // --- UNIQUE APP NAME ---
        IMAGE_NAME = 'anti-react-app-sahilrandive'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        // STAGE 1: Prepare, Build, and Scan (Running inside a temporary Node container)
        stage('Build & SonarQube') {
            steps {
                script {
                    // We pull a Node image temporarily to run npm commands
                    docker.image('node:20-alpine').inside {
                        // 1. Install Dependencies
                        sh 'npm install'
                        
                        // 2. Build the App
                        sh 'npm run build'
                        
                        // 3. Run SonarQube Scanner (needs Node to run)
                        withSonarQubeEnv(installationName: 'SonarQube') { 
                            sh "npx sonarqube-scanner -Dsonar.projectKey=${IMAGE_NAME} -Dsonar.sources=src -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=\$SONAR_AUTH_TOKEN"
                        }
                    }
                }
            }
        }

        // STAGE 2: Build Docker Image (Running on the main Agent)
        stage('Docker Build') {
            steps {
                script {
                    // Build the actual container for deployment
                    dockerImage = docker.build("${IMAGE_NAME}:${TAG}")
                }
            }
        }

        // STAGE 3: Push to Nexus
        stage('Push to Nexus') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: NEXUS_CREDENTIALS_ID, usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        // Login
                        sh "docker login -u ${NEXUS_USER} -p ${NEXUS_PASS} ${NEXUS_REGISTRY}"
                        
                        // Tag
                        sh "docker tag ${IMAGE_NAME}:${TAG} ${NEXUS_REGISTRY}/repository/${NEXUS_REPO}/${IMAGE_NAME}:${TAG}"
                        
                        // Push
                        sh "docker push ${NEXUS_REGISTRY}/repository/${NEXUS_REPO}/${IMAGE_NAME}:${TAG}"
                    }
                }
            }
        }
    }
}