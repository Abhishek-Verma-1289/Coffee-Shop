# 🐳 Docker Deployment Guide

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# From the Coffee-Shop directory
docker-compose up --build
```

This will:
- ✅ Build the Spring Boot backend image
- ✅ Build the React frontend image  
- ✅ Start both services
- ✅ Backend available at: http://localhost:8081
- ✅ Frontend available at: http://localhost:80

### 2. Run in Background (Detached Mode)

```bash
docker-compose up -d
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### 4. Stop Services

```bash
docker-compose down
```

### 5. Rebuild After Code Changes

```bash
docker-compose up --build
```

---

## Manual Docker Commands

### Backend Only

```bash
# Build backend image
cd backend
docker build -t coffee-shop-backend:latest .

# Run backend container
docker run -d -p 8081:8081 --name coffee-shop-backend coffee-shop-backend:latest

# View logs
docker logs -f coffee-shop-backend

# Stop container
docker stop coffee-shop-backend
docker rm coffee-shop-backend
```

### Frontend Only

```bash
# Build frontend image
cd frontend
docker build -t coffee-shop-frontend:latest .

# Run frontend container
docker run -d -p 80:80 --name coffee-shop-frontend coffee-shop-frontend:latest

# View logs
docker logs -f coffee-shop-frontend

# Stop container
docker stop coffee-shop-frontend
docker rm coffee-shop-frontend
```

---

## Docker Image Management

### List Images

```bash
docker images | grep coffee-shop
```

### Remove Images

```bash
# Remove backend image
docker rmi coffee-shop-backend:latest

# Remove frontend image
docker rmi coffee-shop-frontend:latest

# Remove all unused images
docker image prune -a
```

### Tag and Push to Docker Hub (Optional)

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag coffee-shop-backend:latest your-username/coffee-shop-backend:latest
docker tag coffee-shop-frontend:latest your-username/coffee-shop-frontend:latest

# Push to Docker Hub
docker push your-username/coffee-shop-backend:latest
docker push your-username/coffee-shop-frontend:latest
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
│                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │   Frontend (Nginx)   │    │   Backend (Spring)   │  │
│  │   Port: 80           │◄───┤   Port: 8081         │  │
│  │   Node 20 + Vite     │    │   Java 17 + Maven    │  │
│  └──────────────────────┘    └──────────────────────┘  │
│           ▲                                              │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            │ http://localhost
            │
     ┌──────┴────────┐
     │   Browser     │
     └───────────────┘
```

### Network Details

- **Network Name:** `coffee-shop-network`
- **Backend Service:** `backend:8081` (internal)
- **Frontend Service:** `frontend:80` (internal)
- **External Access:**
  - Frontend: http://localhost
  - Backend API: http://localhost:8081/api
  - API proxy through frontend: http://localhost/api

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issue: Port 8081 already in use
# Solution: Stop existing backend or change port in docker-compose.yml
```

### Frontend Can't Connect to Backend

```bash
# Verify backend is running
docker-compose ps

# Check backend health
curl http://localhost:8081/api/queue/orders

# Restart services
docker-compose restart
```

### Build Fails

```bash
# Clear Docker cache and rebuild
docker-compose build --no-cache

# Remove old containers
docker-compose down -v

# Rebuild
docker-compose up --build
```

### Out of Disk Space

```bash
# Clean up unused resources
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

---

## Production Deployment

### Environment Variables

Create `.env` file in project root:

```env
BACKEND_PORT=8081
FRONTEND_PORT=80
SPRING_PROFILE=prod
```

Update `docker-compose.yml`:

```yaml
backend:
  environment:
    - SPRING_PROFILES_ACTIVE=${SPRING_PROFILE}
  ports:
    - "${BACKEND_PORT}:8081"

frontend:
  ports:
    - "${FRONTEND_PORT}:80"
```

### Docker Swarm (Production)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml coffee-shop

# Check services
docker service ls

# Remove stack
docker stack rm coffee-shop
```

### Kubernetes (Advanced)

Generate Kubernetes manifests from Docker Compose:

```bash
# Install kompose
# Windows: choco install kubernetes-kompose
# Mac: brew install kompose

# Convert to Kubernetes
kompose convert -f docker-compose.yml

# Apply to cluster
kubectl apply -f .
```

---

## Performance Tips

### Multi-Stage Builds
- ✅ Backend: Maven build → JRE runtime (reduces image size by ~60%)
- ✅ Frontend: Node build → Nginx static server (reduces image size by ~90%)

### Build Cache
- Dependencies cached as separate layers
- Only rebuild when `pom.xml` or `package.json` change

### Image Sizes
- Backend: ~200 MB (JRE 17 Alpine)
- Frontend: ~25 MB (Nginx Alpine)
- Total: ~225 MB

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker images
        run: |
          docker-compose build
          docker-compose push
```

---

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Verify health: `docker-compose ps`
- Restart: `docker-compose restart`
- Full reset: `docker-compose down -v && docker-compose up --build`
