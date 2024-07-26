![jenkins-kubernetes](https://github.com/user-attachments/assets/4d68c1b4-b72c-43f2-ad22-c6dda862d31b)

_**Real-Time Deployment Kubernetes using CI/CD Jenkins on Localhost**_

_**Portofolio oleh Jouzie Aulia Rezky**_

https://www.linkedin.com/in/aureezz/

Using stacks:
- Windows Subsytem Linux Ubuntu Distro
- Jenkins
- Ngrok
- Docker Desktop (Windows)
- Kubernetes (minikube & kubectl)

Table of Context
- [Skenario Alur CI/CD](https://github.com/aureezzhenx/k8s-jenkins-deploy#skenario-alur-cicd)
- [Arsitektur Kubernetes Cluster](https://github.com/aureezzhenx/k8s-jenkins-deploy#arsitektur-kubernetes-cluster)
- [Setup Job Jenkins](https://github.com/aureezzhenx/k8s-jenkins-deploy#setup)
- [Deployment Phase](https://github.com/aureezzhenx/k8s-jenkins-deploy#deployment-phase)
- [Not Using Latest Tag](https://github.com/aureezzhenx/k8s-jenkins-deploy#setup)
- [Computational Resource](https://github.com/aureezzhenx/k8s-jenkins-deploy#arsitektur-kubernetes-cluster)
- [Rollback Deployment](https://github.com/aureezzhenx/k8s-jenkins-deploy#arsitektur-kubernetes-cluster)

Kubernetes YAML: https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/Deployment.yml


## Skenario alur CI/CD
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/Skenario%20CICD.png></center></img>

### Alur:
1. Developer melakukan Push ke Git Repository.
2. Git Repository akan mengirim Request POST ke URL Jenkins yang sudah di Tunnel HTTP PORT 8080 oleh NGROK sebagai Webhook untuk Event Push.
3. Jenkins menerima Trigger Event Push dari Webhook.
4. Jenkins akan melakukan 3 Job, yaitu membuat Image dari Dockerfile namun tidak memakai versi latest (best practice), lalu Push Image ke Container Registery, lalu Apply Deployment ke Kubernetes Cluster. Untuk di kasus ini, Container Registry yang dipakai adalah Docker Hub.

## Arsitektur Kubernetes Cluster
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/Arsitektur%20Kubernetes%20Cluster.png></center></img>

### Keterangan Service di arsitektur:
- [Deployment/ReplicaSet](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L8). Default: Service Kubernetes Deployment akan secara otomatis membuat ReplicaSet, namun di kasus ini saya menggantikan ReplicaSet menjadi [Horizontal Pod AutoScaller](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L62).
- Masing-Masing Pod akan mengirim informasi penggunaan Resource Hardware ke services [Metrics Server](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L74) sebagai acuan parameter Trigger untuk service [Horizontal Pod AutoScaller](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L62).
- [Horizontal Pod AutoScaller](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L62). Jika CPU Usage di Pod ada di angka rata-rata 70%, maka akan menambah 1 Pod. Jika tidak maka akan berkurang 1 Pod. Minimal Replica: 2, Maksimal Replica: 5
- Masing-masing Pod akan dibatasi penggunaan Resourcenya. Batas maksimal penggunaan Resource masing-masing Pod: [1 Core CPU dan 1GB RAM Memory](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L37)
- [Load Balancer](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L47). Meng-ekspos aplikasi yang ada di Pod Kubernetes Cluster untuk sisi Client.
- Semua service ada di satu Namespace yang sama, yaitu [backend](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/adc63888855c0b77d623ac5314dadf1f691d477a/Deployment.yml#L1).

Penggunaan Horizontal Pod Autoscaler sangat membantu untuk masalah Backpressure jika aplikasi yang ada di Pod menerima Traffic terlalu banyak.

Kubernetes YAML: https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/Deployment.yml

## Setup

Image Version Docker yang dibuat oleh Job Jenkins saya tidak memakai tag Latest sebagai best-practicenya, saya memakai Environment Build ID dari Jenkins.

[Deployment.yml Line 34](https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/45f5227855073d57abc51d92501ebaccc80f8349/Deployment.yml#L34C11-L34C59)

Referensi: https://wiki.jenkins-ci.org/display/JENKINS/Building+a+software+project#Buildingasoftwareproject-belowJenkinsSetEnvironmentVariables

```
# Execute Shell
export NAMA_IMAGE=$JOB_NAME
export VERSION_BUILD=$BUILD_ID
```

```
# deployment.yml line 34
image: aureezzhenx/$NAMA_IMAGE:v1.$VERSION_BUILD
```

Tunnel Port 8080 menggunakan NGROK. Port 8080 adalah Jenkins

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/ngrok.png></center>

Input Payload URL Webhook yang sudah di port-forward oleh NGROK di pengaturan Repository.

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/webhook.png></center> 

Membuat Freestyle Project di Jenkins

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/job.png></center> 

Mengatur Job

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/job2.png></center>
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/job3.png></center>
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/job4.png></center>

Execute Shell
```
# Build container and push to registry (hub.docker)
docker build -t aureezzhenx/$JOB_NAME:v1.$BUILD_ID .
docker push aureezzhenx/$JOB_NAME:v1.$BUILD_ID

# Store ENV for versioning image (not using latest tag)
export NAMA_IMAGE=$JOB_NAME
export VERSION_BUILD=$BUILD_ID

# Deploy image ke k8s cluster
cat Deployment.yml | sed 's/$NAMA_IMAGE/'"$JOB_NAME"'/' | sed 's/$VERSION_BUILD/'"$BUILD_ID"'/' | kubectl apply -f -
```

Image Version Docker yang dibuat oleh Job Jenkins saya tidak memakai tag Latest sebagai best-practicenya, saya memakai Environment Build ID dari Jenkins.

## Deployment Phase

Jenkins akan menerima trigger dari Webhook jika Developer ada aktifitas Push ke Repository. Di Deployment Phase ini untuk Build ID nya adalah 55

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build1.png></center> 
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build2.png></center>

Deployment Sukses

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build3.png></center>
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/sukses1.png></center>
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/sukses2.png></center>

Hasil Docker Image yang sudah dibuat oleh Job Jenkins, tidak menggunakan versi latest.

https://hub.docker.com/layers/aureezzhenx/k8s-jenkins-deploy/v1.55/images/sha256-2e4b8d7ac2c079500eb8e12a40eb63e3083340e4919f15e02ff314171594de05?context=explore

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build4.png></center>
