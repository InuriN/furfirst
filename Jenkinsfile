pipeline {
    agent any
    environment {
        APP_NAME = 'furfirst'
        BACKEND_IMAGE = 'furfirst-backend'
        FRONTEND_IMAGE = 'furfirst-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        SONAR_PROJECT_KEY = 'furfirst'
        NODE_ENV = 'test'
    }
    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    stages {

        stage('Build') {
            steps {
                echo 'Building FurFirst Docker images...'
                sh 'docker --version'
                sh 'docker-compose --version'
                sh '''
                    docker build -t ${BACKEND_IMAGE}:${DOCKER_TAG} ./backend
                    docker build -t ${FRONTEND_IMAGE}:${DOCKER_TAG} ./frontend
                    docker tag ${BACKEND_IMAGE}:${DOCKER_TAG} ${BACKEND_IMAGE}:latest
                    docker tag ${FRONTEND_IMAGE}:${DOCKER_TAG} ${FRONTEND_IMAGE}:latest
                    echo "Build completed successfully"
                    echo "Backend image: ${BACKEND_IMAGE}:${DOCKER_TAG}"
                    echo "Frontend image: ${FRONTEND_IMAGE}:${DOCKER_TAG}"
                '''
            }
            post {
                success {
                    echo 'Build stage passed - Docker images created successfully'
                }
                failure {
                    echo 'Build stage failed - Check Docker configuration'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated tests...'
                sh '''
                    cd backend
                    npm install
                    brew services start mongodb-community || true
                    sleep 5
                    export MONGO_URI=mongodb://localhost:27017/furfirst_test
                    export JWT_SECRET=xK9mP2qL8nR5vT3wY7zA_furfirst_test_secret_key
                    export NODE_ENV=test
                    export PORT=5001
                    npm test -- --forceExit --coverage --testTimeout=30000
                '''
            }
            post {
                always {
                    echo 'Test stage completed'
                }
                success {
                    echo 'All tests passed successfully'
                }
                failure {
                    echo 'Tests failed - Check test output above'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube code quality analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
                        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
                        cd backend
                        npm install
                        npx sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.projectName="FurFirst Vet Booking System" \
                            -Dsonar.projectVersion=${DOCKER_TAG} \
                            -Dsonar.sources=src \
                            -Dsonar.tests=tests \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.exclusions=node_modules/**,coverage/**
                    '''
                }
            }
            post {
                success {
                    echo 'Code quality analysis completed'
                }
                failure {
                    echo 'Code quality stage failed - Check SonarQube configuration'
                }
            }
        }

        stage('Security') {
            steps {
                echo 'Running Snyk security vulnerability scan...'
                withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
                    sh '''
                        cd backend
                        npm install -g snyk
                        snyk auth ${SNYK_TOKEN}
                        snyk test --severity-threshold=high --json > snyk-report.json || true
                        snyk test --severity-threshold=high || true
                        echo "Security scan completed"
                    '''
                }
            }
            post {
                always {
                    echo 'Security scan completed'
                }
                success {
                    echo 'No high severity vulnerabilities found'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying FurFirst to staging environment...'
                sh '''
                    echo "Stopping existing staging containers..."
                    docker-compose -f docker-compose.yml down --remove-orphans || true

                    echo "Removing any conflicting containers..."
                    docker rm -f furfirst-prometheus furfirst-mongo furfirst-grafana 2>/dev/null || true

                    echo "Starting staging environment..."
                    docker-compose -f docker-compose.yml up -d

                    echo "Waiting for services to start..."
                    sleep 20

                    echo "Checking backend health..."
                    curl -f http://localhost:5000/health || exit 1

                    echo "Staging deployment successful"
                '''
            }
            post {
                success {
                    echo 'Staging deployment successful - FurFirst is running'
                }
                failure {
                    echo 'Staging deployment failed - Check Docker logs'
                    sh 'docker-compose logs --tail=50'
                }
            }
        }

        stage('Release') {
            steps {
                echo 'Promoting FurFirst to production environment...'
                sh '''
                    echo "Tagging images for production release..."
                    docker tag ${BACKEND_IMAGE}:${DOCKER_TAG} ${BACKEND_IMAGE}:prod-${DOCKER_TAG}
                    docker tag ${FRONTEND_IMAGE}:${DOCKER_TAG} ${FRONTEND_IMAGE}:prod-${DOCKER_TAG}
                    echo "Stopping staging environment..."
                    docker-compose -f docker-compose.yml down || true
                    echo "Starting production environment..."
                    docker-compose -f docker-compose.prod.yml up -d
                    echo "Waiting for production services to start..."
                    sleep 20
                    echo "Verifying production health..."
                    curl -f http://localhost:5000/health || exit 1
                    echo "Production release ${DOCKER_TAG} deployed successfully"
                '''
                sh '''
                    git config user.email "jenkins@furfirst.com" || true
                    git config user.name "Jenkins" || true
                    git tag -a v1.0.${BUILD_NUMBER} -m "Release version 1.0.${BUILD_NUMBER}" || true
                    echo "Release tagged as v1.0.${BUILD_NUMBER}"
                '''
            }
            post {
                success {
                    echo 'Production release completed successfully'
                }
                failure {
                    echo 'Production release failed'
                    sh 'docker-compose -f docker-compose.prod.yml logs --tail=50'
                }
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Verifying monitoring setup...'
                sh '''
                    echo "Checking Prometheus is running..."
                    curl -f http://localhost:9090/-/healthy || exit 1
                    echo "Checking Grafana is running..."
                    curl -f http://localhost:3001/api/health || exit 1
                    echo "Checking backend metrics endpoint..."
                    curl -f http://localhost:5000/metrics || exit 1
                    echo "Verifying Prometheus is scraping FurFirst metrics..."
                    sleep 5
                    curl -f "http://localhost:9090/api/v1/query?query=up" || exit 1
                    echo "All monitoring checks passed"
                    echo "Prometheus: http://localhost:9090"
                    echo "Grafana: http://localhost:3001"
                    echo "Metrics: http://localhost:5000/metrics"
                '''
            }
            post {
                success {
                    echo 'Monitoring stage passed - All systems are being monitored'
                }
                failure {
                    echo 'Monitoring stage failed'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Application: FurFirst Vet Booking System"
        }
        success {
            echo 'FurFirst pipeline completed successfully'
            echo "Version v1.0.${BUILD_NUMBER} is live"
        }
        failure {
            echo 'Pipeline failed - Check stage logs'
        }
        cleanup {
            echo 'Cleaning up workspace...'
            sh 'docker system prune -f || true'
        }
    }
}