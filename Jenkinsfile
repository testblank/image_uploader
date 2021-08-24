pipeline {
  agent any
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
  }
  environment {
    SLACK_COLOR_GOOD = '#3EB991'
    SLACK_COLOR_DANGER = '#E01563'
  }
  post {
    success {
      slackSend(color: "${env.SLACK_COLOR_GOOD}", channel: '#cafe', message: '''*BUILD SUCCESS* \nvisit http://104.199.198.188:4000/''')
    }
    failure {
      slackSend(color: "${env.SLACK_COLOR_DANGER}", channel: '#cafe', message: '*BUILD FAILURE*')
    }
  }
}