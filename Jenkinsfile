pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:20
    command:
    - cat
    tty: true
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command:
    - cat
    tty: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
    securityContext:
      runAsUser: 0
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig
  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-config
      mountPath: /etc/docker/daemon.json
      subPath: daemon.json
  volumes:
  - name: docker-config
    configMap:
      name: docker-daemon-config
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    stages {
        stage('Install Dependencies & Test') {
            steps {
                container('node') {
                   sh '''
                       npm install
                       npm test
                   '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        sleep 15
                        docker build -t anti:latest .
                        docker image ls
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                     withCredentials([string(credentialsId: 'sonar-token-2401167', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                                -Dsonar.projectKey=2401167_anti \
                                -Dsonar.host.url=http://sonarqube.imcc.com \
                                -Dsonar.login=$SONAR_TOKEN \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                -Dsonar.sources=src \
                                -Dsonar.tests=test
                        '''
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh 'docker --version'
                    sh 'sleep 10'
                    sh 'docker login nexus.imcc.com -u student -p Imcc@2025'
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh 'docker tag anti:latest nexus.imcc.com/2401167-project/anti:latest'
                    sh 'docker push nexus.imcc.com/2401167-project/anti:latest'
                }
            }
        }


        stage('Deploy AI Application') {
            steps {
                container('kubectl') {
                    script {
                        dir('k8s-deployment') {
                            sh '''
                                # Apply all resources in deployment YAML
                                kubectl apply -f anti-deployment.yaml

                                # Wait for rollout
                                kubectl rollout status deployment/anti -n 2401167
                            '''
                        }
                    }
                }
            }
        }
    }
}
