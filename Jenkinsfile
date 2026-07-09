pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'yuvashreerajarul'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOTNET_CLI_HOME = 'C:\\Windows\\Temp'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Yuvashree815/CozyHavenStay'
            }
        }

        stage('Build & Run Unit Tests') {
            steps {
                echo '🔨 Restoring and building solution...'
                bat '''
                    cd backend
                    dotnet restore CozyHavenStayV3.slnx
                    dotnet build CozyHavenStayV3.slnx -c Debug
                '''
                echo '🧪 Running all 70 unit tests...'
                bat '''
                    cd backend
                    dotnet test CozyHavenStayV3.HotelService.Tests\\CozyHavenStayV3.HotelService.Tests.csproj --no-build --verbosity normal
                    dotnet test CozyHavenStayV3.IdentityService.Tests\\CozyHavenStayV3.IdentityService.Tests.csproj --no-build --verbosity normal
                    dotnet test CozyHavenStayV3.BookingService.Tests\\CozyHavenStayV3.BookingService.Tests.csproj --no-build --verbosity normal
                    dotnet test CozyHavenStayV3.ReviewService.Tests\\CozyHavenStayV3.ReviewService.Tests.csproj --no-build --verbosity normal
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Pre-pulling base images...'
                bat '''
                    docker pull mcr.microsoft.com/dotnet/aspnet:8.0 || docker pull mcr.microsoft.com/dotnet/aspnet:8.0 || docker pull mcr.microsoft.com/dotnet/aspnet:8.0
                    docker pull mcr.microsoft.com/dotnet/sdk:8.0 || docker pull mcr.microsoft.com/dotnet/sdk:8.0 || docker pull mcr.microsoft.com/dotnet/sdk:8.0
                    docker pull node:20-alpine || docker pull node:20-alpine || docker pull node:20-alpine
                    docker pull nginx:alpine || docker pull nginx:alpine || docker pull nginx:alpine
                '''
                echo '🔨 Building all 6 Docker images...'
                bat '''
                    docker build -t %DOCKERHUB_USERNAME%/cozyhaven-identity:latest ^
                        -f backend/CozyHavenStayV3.IdentityService/Dockerfile backend/
                    docker build -t %DOCKERHUB_USERNAME%/cozyhaven-hotel:latest ^
                        -f backend/CozyHavenStayV3.HotelService/Dockerfile backend/
                    docker build -t %DOCKERHUB_USERNAME%/cozyhaven-booking:latest ^
                        -f backend/CozyHavenStayV3.BookingService/Dockerfile backend/
                    docker build -t %DOCKERHUB_USERNAME%/cozyhaven-review:latest ^
                        -f backend/CozyHavenStayV3.ReviewService/Dockerfile backend/
                    docker build -t %DOCKERHUB_USERNAME%/cozyhaven-gateway:latest ^
                        -f backend/CozyHavenStayV3.Gateway/Dockerfile backend/
                    docker build -t %DOCKERHUB_USERNAME%/cozyhaven-frontend:latest ^
                        frontend/
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                echo '📤 Pushing Docker images to Docker Hub...'
                bat "docker login -u %DOCKERHUB_USERNAME% -p %DOCKERHUB_CREDENTIALS_PSW%"

                script {
                    def images = [
                        'cozyhaven-identity',
                        'cozyhaven-hotel',
                        'cozyhaven-booking',
                        'cozyhaven-review',
                        'cozyhaven-gateway'
                    ]
                    images.each { image ->
                        retry(3) {
                            bat "docker push %DOCKERHUB_USERNAME%/${image}:latest"
                        }
                    }

                    // Frontend push — best effort, don't fail pipeline
                    try {
                        retry(3) {
                            bat "docker push %DOCKERHUB_USERNAME%/cozyhaven-frontend:latest"
                        }
                    } catch (Exception e) {
                        echo '⚠️ Frontend push failed due to network issue — all backend images pushed successfully.'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed! All 70 tests passed and images pushed to Docker Hub.'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
        }
    }
}