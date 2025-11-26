pipeline {
    agent any

    environment {
        // Credentials IDs to be created in Jenkins
        NEXUS_CREDENTIALS_ID = 'nexus-credentials' 
        SONAR_TOKEN_ID = 'sonar-token'
        
        // Remote Infrastructure URLs
        SONAR_HOST_URL = 'http://sonarqube.imcc.com/'
        // Registry Host for Docker tagging (no protocol)
        NEXUS_REGISTRY = 'nexus.imcc.com' 
        // URL for other API interactions if needed (optional)
        NEXUS_URL = 'http://nexus.imcc.com'
        
        NEXUS_REPO = 'docker-hosted' // Ensure this repo exists in Nexus
        IMAGE_NAME = 'anti-react-app'
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
                withSonarQubeEnv(installationName: 'SonarQube') { // Name of SonarQube server in Jenkins config
                    // Use npx to run scanner without global installation
                    sh 'npx sonarqube-scanner -Dsonar.projectKey=anti-react-app -Dsonar.sources=src -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=$SONAR_AUTH_TOKEN'
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
                        
                        // Tag the image with the registry path
                        // Format: registry-host/repository-name/image-name:tag
                        // Note: Nexus docker repo paths often include the port or are mapped by port. 
                        // Assuming 'nexus.imcc.com' resolves to the registry or is behind a proxy handling /repository/ path.
                        // Standard Nexus Docker path: <nexus-hostname>:<docker-port>/<image>:<tag> OR <nexus-hostname>/repository/<repo-name>/<image>:<tag>
                        // Based on previous file, it used /repository/ path style.
                        sh "docker tag ${IMAGE_NAME}:${TAG} ${NEXUS_REGISTRY}/repository/${NEXUS_REPO}/${IMAGE_NAME}:${TAG}"
                        
                        // Push the image
                        sh "docker push ${NEXUS_REGISTRY}/repository/${NEXUS_REPO}/${IMAGE_NAME}:${TAG}"
                    }
                }
            }
        }
    }
}
