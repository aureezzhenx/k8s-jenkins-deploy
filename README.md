# Real-Time Deployment Kubernetes using CI/CD Jenkins on Localhost

![jenkins-kubernetes](https://github.com/user-attachments/assets/4d68c1b4-b72c-43f2-ad22-c6dda862d31b)

Portfolio oleh Jouzie Aulia Rezky

https://www.linkedin.com/in/aureezz/

Using stacks
- WSL Ubuntu Distro
- Jenkins
- Ngrok
- Docker
- Kubernetes (minikube & kubectl)

Skenario alur CI/CD
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/Skenario%20CICD.png></center></img>

Alur:
1. Developer melakukan Push ke Git Repository.
2. Git Repository akan mengirim Request POST ke URL Jenkins yang sudah di Tunnel HTTP PORT 8080 oleh NGROK sebagai Webhook untuk Event Push.
3. Jenkins menerima Trigger Event Push dari Webhook.
4. Jenkins akan melakukan 3 Job, yaitu membuat Image dari Dockerfile namun tidak memakai versi latest (best practice), lalu Push Image ke Container Registery, lalu Apply Deployment ke Kubernetes Cluster. Untuk di kasus ini, Container Registry yang dipakai adalah Docker Hub.

Image Version Docker yang dibuat oleh Job Jenkins saya tidak memakai tag Latest sebagai best-practicenya, saya memakai Environment Build ID dari Jenkins.

Arsitektur Kubernetes Cluster
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/Arsitektur%20Kubernetes%20Cluster.png></center></img>

Keterangan Service di arsitektur:
- Deployment/ReplicaSet. Default: Deployment akan secara otomatis membuat ReplicaSet, namun di kasus ini saya menggantikan ReplicaSet menjadi Horizontal Pod AutoScaller.
- Horizontal Pod AutoScaller. Jika CPU Usage di Pod ada di angka rata-rata 70%, maka akan menambah 1 Pod. Jika tidak maka akan berkurang 1 Pod.
- Load Balancer. Meng-ekspos aplikasi yang ada di Pod Kubernetes Cluster untuk sisi Client.

Setup

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

Deployment Phase

Jenkins akan menerima trigger dari Jenkins jika Developer ada aktifitas Push ke Repository. Di Deployment Phase ini untuk Build ID nya adalah 55

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build1.png></center> 
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build2.png></center>

Deployment Sukses

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build3.png></center>

Hasil Docker Image yang sudah dibuat oleh Job Jenkins, tidak menggunakan versi latest.

<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/build4.png></center>
