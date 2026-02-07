# Coffee Shop Queue System - Docker Deployment Instructions

## 🎯 Quick Start (2 Commands)

### Prerequisites
- Docker Desktop installed and running
- Internet connection

### Method 1: Using Docker Compose (Recommended)

**Step 1:** Create `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  backend:
    image: abhishek1289verma/coffee-shop-backend:latest
    container_name: coffee-backend
    ports:
      - "8082:8081"
    networks:
      - coffee-network

  frontend:
    image: abhishek1289verma/coffee-shop-frontend:latest
    container_name: coffee-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - coffee-network

networks:
  coffee-network:
    driver: bridge
```

**Step 2:** Run:

```bash
docker-compose up -d
```

**Step 3:** Open browser:
- **Dashboard:** http://localhost
- **Analytics:** http://localhost/analytics

---

### Method 2: Manual Docker Commands

```bash
# Pull images from Docker Hub
docker pull abhishek1289verma/coffee-shop-backend:latest
docker pull abhishek1289verma/coffee-shop-frontend:latest

# Create network
docker network create coffee-network

# Run backend
docker run -d \
  --name coffee-backend \
  --network coffee-network \
  -p 8082:8081 \
  abhishek1289verma/coffee-shop-backend:latest

# Run frontend
docker run -d \
  --name coffee-frontend \
  --network coffee-network \
  -p 80:80 \
  abhishek1289verma/coffee-shop-frontend:latest

# Access app: http://localhost
```

---

## 🎮 Features to Test

### 1. Dashboard (http://localhost)
- **Add Orders:** Click "Random Order" or select specific drink
- **View Queue:** Orders sorted by SMART priority algorithm
- **Barista Status:** See which baristas are working
- **Mode Toggle:** Switch between SMART and FIFO modes

### 2. Analytics Page (http://localhost/analytics)
- **Rush Hour Simulation:** Click "Simulate Rush Hour (100 Orders)"
- **View Stats:** Compare SMART vs FIFO performance
- **History:** See previous simulation runs
- **Order Details:** Click "Orders Served" to see all 100 orders

---

## 🔬 Priority Algorithm Details

**SMART Priority Formula:**
```
Priority Score = (Wait Time × 40%) + (Complexity × 25%) + (Loyalty × 10%) + (Urgency × 25%)
```

**Customer Types:**
- 🆕 New Customer (timeout: 8 min)
- 👤 Regular Customer (timeout: 10 min, loyalty: +5)
- ⭐ Gold Member (timeout: 10 min, loyalty: +10)

**Drink Complexity:**
- Espresso: 2 min
- Americano: 2.5 min
- Cappuccino: 4 min
- Latte: 3 min
- Mocha: 6 min
- Specialty: 5 min

**Special Features:**
- 🚨 Emergency Boost: +50 priority at 8 min wait
- ⚖️ Fairness Tracking: Penalty if >3 people skip ahead
- 🔄 Workload Balancing: Overloaded baristas get quick orders

---

## 📊 What to Look For in Simulation

**SMART Algorithm Advantages:**
1. **Lower Average Wait Time** (~4-6 min vs ~6-8 min FIFO)
2. **Fewer Complaints** (orders >10 min total time)
3. **Balanced Workload** across 3 baristas
4. **Customer Retention** (fewer abandonments)

---

## 🛠️ Troubleshooting

### Port 80 Already in Use

```bash
# Stop existing containers
docker stop coffee-frontend coffee-backend

# Change frontend port to 3000
docker run -d --name coffee-frontend -p 3000:80 abhishek1289verma/coffee-shop-frontend:latest

# Access: http://localhost:3000
```

### Backend Not Connecting

```bash
# Check logs
docker logs coffee-backend
docker logs coffee-frontend

# Restart services
docker restart coffee-backend
docker restart coffee-frontend
```

### Clean Restart

```bash
# Stop and remove all containers
docker-compose down

# Remove containers manually
docker stop coffee-frontend coffee-backend
docker rm coffee-frontend coffee-backend

# Start fresh
docker-compose up -d
```

---

## 📦 Image Details

**Backend Image:**
- Base: Java 17 (Eclipse Temurin Alpine)
- Framework: Spring Boot 3.2.2
- Size: ~295 MB
- Port: 8081 (mapped to 8082)

**Frontend Image:**
- Base: Nginx Alpine
- Framework: React 18 + Vite
- Size: ~93 MB
- Port: 80

**Total Download:** ~388 MB

---

## 🔗 Docker Hub Links

- Backend: https://hub.docker.com/r/abhishek1289verma/coffee-shop-backend
- Frontend: https://hub.docker.com/r/abhishek1289verma/coffee-shop-frontend

---

## 📝 Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.2.2
- REST API
- In-memory queue management

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router DOM

**Deployment:**
- Docker
- Multi-stage builds
- Nginx reverse proxy

---

## 👨‍💻 API Endpoints

GET /orders/queue - Get all orders in queue
POST /orders/random - Add random order
POST /orders/create - Create specific order
GET /baristas/status - Get barista status
GET /analytics/stats - Get analytics
POST /analytics/rush-hour-100 - Run simulation
GET /simulate/metrics - Get simulation metrics
POST /simulate/mode - Toggle SMART/FIFO mode

---

## 📧 Contact

For issues or questions, check:
- Docker logs: `docker logs <container_name>`
- Container status: `docker ps`
- Network: `docker network inspect coffee-network`

---

**Enjoy testing the Smart Coffee Queue System!** ☕🚀
