About
===

- The project consists of a simple web application (HTML + JavaScript) that is deployed to a Docker container (running httpd)
- CloudFormation is used to provision clusters in ECS and publish the application URL to DNS (in Route 53)
  - Release pipeline are used in Jenkins to implement Continuous Delivery (CD)
  - The stack is re-created for lower environments
  - In the higher environments, a change-set is created against the existing stack
  
Steps
===
  
Run locally
====

```
$ docker build -t webapp:latest .
$ docker run -d -P webapp:latest
```
  
Release pipelines and build jobs
====
  
- The release pipeline consists of an upstream build job and downstream provisioning job 
- The build job pulls the application artifacts from version control, builds a Docker image, and pushes the image to a repository in ECR, and triggers the downstream provisioning job
- The provisioning job uses the templates provided to create or update a stack in CloudFormation
    
    
  

