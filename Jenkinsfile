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
                    url: 'https://github.com/Yuvashree815/CozyHavenStayV3'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo '🧪 Running all 70 unit tests...'
                bat '''
                    cd backend
                    dotnet test --no-build --verbosity normal ^
                        CozyHavenStayV3.HotelService.Tests\\CozyHavenStayV3.HotelService.Tests.csproj
                    dotnet test --no-build --verbosity normal ^
                        CozyHavenStayV3.IdentityService.Tests\\CozyHavenStayV3.IdentityService.Tests.csproj
                    dotnet test --no-build --verbosity normal ^
                        CozyHavenStayV3.BookingService.Tests\\CozyHavenStayV3.BookingService.Tests.csproj
                    dotnet test --no-build --verbosity normal ^
                        CozyHavenStayV3.ReviewService.Tests\\CozyHavenStayV3.ReviewService.Tests.csproj
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
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
                bat '''
                    docker login -u %DOCKERHUB_USERNAME% -p %DOCKERHUB_CREDENTIALS_PSW%
                    docker push %DOCKERHUB_USERNAME%/cozyhaven-identity:latest
                    docker push %DOCKERHUB_USERNAME%/cozyhaven-hotel:latest
                    docker push %DOCKERHUB_USERNAME%/cozyhaven-booking:latest
                    docker push %DOCKERHUB_USERNAME%/cozyhaven-review:latest
                    docker push %DOCKERHUB_USERNAME%/cozyhaven-gateway:latest
                    docker push %DOCKERHUB_USERNAME%/cozyhaven-frontend:latest
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully! All tests passed and images pushed to Docker Hub.'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
        }
    }
}