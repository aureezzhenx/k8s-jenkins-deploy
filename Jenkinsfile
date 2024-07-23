pipeline {
    agent any
    options
    stages
    {
        stage('Echo Start')
        {
            steps
            {
                echo 'Start Deploy k8s'
            }
        }
        stage('docker login')
        {
            steps
            {
                docker build -t aureezzhenx/$JOB_NAME:v1.$BUILD_ID .
            }
        }
    }
}