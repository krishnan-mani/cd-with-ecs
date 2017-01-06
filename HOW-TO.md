About
===

- The project consists of a simple web application (HTML + JavaScript) that is deployed to a Docker container (running httpd)
- CloudFormation is used to provision clusters in ECS, and publish the application location to DNS (in Route 53)
  - Release pipeline are used in Jenkins to implement Continuous Delivery (CD)
  - The stack is re-created for lower environments
  - In the higher environments, a change-set is created against the existing stack
  
Steps
===
  
- Run locally


```bash
$ docker build -t my-bookstore:latest .
$ docker run -d -P my-bookstore:latest
```
  
- Release pipelines and build jobs

  - The release pipeline consists of an upstream build job and downstream provisioning job 
  - The build job pulls the application artifacts from version control, builds a Docker image, and pushes the image to a repository in ECR, and triggers the downstream provisioning job
  - The provisioning job uses the templates provided to create or update a stack in CloudFormation
  - Independent release pipelines are used for each environment. 
  - We use a (branching workflow)[https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows] with Git, and each pipeline polls a particular branch for changes
  - The development environment is deployed off the "develop" branch, and the UAT environment is deployed off "master" branch
  - We use a convention for the Docker image tags, and the change-set that uses the commit key, for improved traceability

    
Build steps
===

- Parameterised values  
  - APP_NAME
  - IMAGE_REPOSITORY
  - IMAGE_TAG
  - ENVIRONMENT_NAME
  - STACK_NAME  
  - CHANGE_SET_NAME
  - AWS_REGION

- Publish to ECR

```bash

$ eval $(aws --region ${AWS_REGION} ecr get-login)
$ docker push ${ECR_IMAGE_TAG} 

```

- Create CloudFormation stack

```bash

$ aws --region ${AWS_REGION} cloudformation create-stack \
    --stack-name ${STACK_NAME} \
    --template-body file://${WORKSPACE}/environments/ecs.json \
    --parameters $(node ${WORKSPACE}/environments/conf/emitCloudFormationParameters.js ${WORKSPACE}/environments/conf/ecs/${ENVIRONMENT_NAME}.json) \
    ParameterKey=ImageRepository,ParameterValue=${IMAGE_REPOSITORY} \
    ParameterKey=ImageTag,ParameterValue=${GIT_COMMIT:0:7} \
    --capabilities CAPABILITY_IAM \
    --output text  
$ aws --region ${AWS_REGION} cloudformation wait stack-create-complete --stack-name ${STACK_NAME}

```

- Create change-set in CloudFormation

```bash

$ export CHANGE_SET_NAME="COMMIT-${GIT_COMMIT:0:7}"

$ aws --region ${AWS_REGION} cloudformation create-change-set \
  --change-set-name ${CHANGE_SET_NAME} \
  --stack-name ${STACK_NAME} \
  --template-body file://${WORKSPACE}/environments/ecs.json \
  --parameters $(node ${WORKSPACE}/environments/conf/emitCloudFormationParameters.js ${WORKSPACE}/environments/conf/ecs/${ENVIRONMENT_NAME}.json) \
    ParameterKey=ImageRepository,ParameterValue=${IMAGE_REPOSITORY} \
    ParameterKey=ImageTag,ParameterValue=${IMAGE_TAG} \
  --capabilities CAPABILITY_IAM \
  --output text
$ aws --region ${AWS_REGION} cloudformation wait change-set-create-complete --stack-name ${STACK_NAME}
  
```