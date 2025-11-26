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
        stage('Full Pipeline') {
            steps {
                // CRITICAL FIX: Run everything inside the 'dind' container
                // This container has Docker pre-installed.
                container('dind') {
                    script {
                        // 1. Install Node.js & NPM manually inside this container
                        // (The 'dind' image is Alpine Linux, so we use apk)
                        sh 'apk add --no-cache nodejs npm'
                        
                        // 2. Install Dependencies & Build
                        sh 'npm install'
                        sh 'npm run build'
                        
                        // 3. Run SonarQube Scanner
                        withSonarQubeEnv(installationName: 'SonarQube') { 
                            sh "npx sonarqube-scanner -Dsonar.projectKey=${IMAGE_NAME} -Dsonar.sources=src -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=\$SONAR_AUTH_TOKEN"
                        }

                        // 4. Docker Build
                        // We are already inside the dind container, so 'docker' commands work directly
                        dockerImage = docker.build("${IMAGE_NAME}:${TAG}")

                        // 5. Push to Nexus
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
}