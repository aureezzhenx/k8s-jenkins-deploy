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

1. Developer melakukan Push ke Git Repository.
2. Git Repository akan mengirim Request POST ke URL Jenkins yang sudah di Tunnel HTTP PORT 8080 oleh NGROK sebagai Webhook untuk Event Push.
3. Jenkins menerima Trigger Event Push dari Webhook.
4. Jenkins akan melakukan 3 Job, yaitu membuat Image dari Dockerfile, lalu Push Image ke Container Registery, lalu Apply Deployment ke Kubernetes Cluster. Untuk di kasus ini, Container Registry yang dipakai adalah Docker Hub.

Arsitektur Kubernetes Cluster
<center><img src=https://github.com/aureezzhenx/k8s-jenkins-deploy/blob/main/assets/Arsitektur%20Kubernetes%20Cluster.png></center></img>

Keterangan Service di arsitektur:
- Deployment/ReplicaSet. Default: Deployment akan secara otomatis membuat ReplicaSet, namun di kasus ini saya menggantikan ReplicaSet menjadi Horizontal Pod AutoScaller.
- Horizontal Pod AutoScaller. Jika CPU Usage di Pod ada di angka rata-rata 70%, maka akan menambah 1 Pod. Jika tidak maka akan berkurang 1 Pod.
- Load Balancer. Meng-ekspos aplikasi yang ada di Kubernetes Cluster untuk sisi Client.
