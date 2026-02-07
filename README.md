# ☕ Smart Coffee Queue Management System

> Intelligent café order prioritization with real-time barista assignment

A live dashboard where orders arrive in real-time, priorities reshuffle dynamically, baristas get assigned automatically, and wait times stay under control — all visible on screen.

## 🎯 Problem Solved

Traditional FIFO (First-In-First-Out) queues cause:
- Long wait times (12+ minutes)
- No differentiation between simple vs complex drinks
- Customer frustration from timeout orders

**Our Solution:** Smart priority queue that optimizes for:
- **Wait time** (older orders boost automatically)
- **Drink complexity** (cold brews get priority)
- **Urgency detection** (8+ min orders get emergency boost)

---

## 🏗️ Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.2.2
- In-memory data structures (no database needed)
- RESTful APIs
- Scheduled tasks for automation

**Frontend:**
- React 18
- Vite (fast dev server)
- Tailwind CSS
- Axios for API calls

---

## 🚀 Quick Start

### Prerequisites
- Java 17+ (check with `java -version`)
- Node.js 16+ (check with `node -version`)
- Maven (or use included mvnw)

### 1. Start Backend (Terminal 1)

```bash
cd backend
mvn spring-boot:run

# Or with Maven wrapper
./mvnw spring-boot:run  # Mac/Linux
mvnw.cmd spring-boot:run  # Windows
```

Backend runs on: **http://localhost:8080**

### 2. Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

### 3. Open Browser

Navigate to **http://localhost:3000** and you'll see:
- ✅ Live order queue with color-coded priorities
- ✅ 3 barista cards showing real-time status
- ✅ Performance metrics dashboard
- ✅ Simulation controls to demo the system

---

## 🎮 How to Demo

### Step 1: Start in FIFO Mode
1. Click the mode toggle to switch to **FIFO MODE**
2. Click "Trigger Rush Hour" (adds 5-8 orders)
3. Watch wait times climb above 10 minutes
4. Point out the red urgent alerts

### Step 2: Switch to Smart Mode
1. Toggle to **SMART MODE** 
2. Watch the queue instantly reshuffle by priority
3. Point out the priority reasons ("URGENT - Wait time exceeded")
4. Show how short orders (Espresso) get small boosts

### Step 3: Show Auto-Assignment
1. Watch baristas automatically grab orders
2. Point out countdown timers
3. When barista finishes, new order auto-assigns

### Step 4: Metrics Comparison
1. Compare FIFO metrics vs SMART metrics
2. Show reduced avg wait time
3. Lower timeout rate
4. Better throughput

---

## 📊 API Endpoints

### Orders
- `GET /orders/queue` - Get current queue
- `POST /orders/random` - Add random order
- `POST /orders/create` - Add specific drink

### Baristas
- `GET /baristas/status` - Get all barista states
- `GET /baristas/stats` - Get free/busy counts

### Simulation
- `POST /simulate/minute` - Advance 1 minute
- `POST /simulate/rush` - Add 5-8 orders
- `POST /simulate/reset` - Clear everything
- `POST /simulate/mode` - Switch FIFO/SMART
- `GET /simulate/metrics` - Get performance data

---

## 🧠 Priority Algorithm

```java
Priority = (wait_time × 3) + complexity_score + urgent_boost + short_order_bonus

Urgency Levels:
🟢 NORMAL (0-5 min)
🟡 ELEVATED (5-8 min)  
🔴 URGENT (8+ min) → +50 priority boost
```

**Dynamic Recalculation:** Every 30 seconds, all order priorities recalculate automatically so older orders rise to the top.

---

## 📁 Project Structure

```
Coffee-Shop/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/hackathon/coffeeshop/
│   │   ├── model/             # Order, Barista, DrinkType
│   │   ├── service/           # QueueService, BaristaService
│   │   ├── controller/        # REST API endpoints
│   │   └── config/            # CORS, WebSocket config
│   └── pom.xml                # Maven dependencies
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── components/        # OrderQueue, BaristaBoard, etc.
│   │   ├── services/          # API client
│   │   └── App.jsx            # Main app with polling
│   └── package.json           # npm dependencies
│
└── README.md                   # This file
```

---

## 🎨 Key Features

### ✅ Implemented
- [x] Smart priority queue (FIFO vs SMART toggle)
- [x] 3 baristas with auto-assignment
- [x] Color-coded urgency levels
- [x] Real-time metrics (avg wait, timeout rate, etc.)
- [x] Simulation controls (add orders, rush hour, reset)
- [x] Automatic time progression (30s intervals)
- [x] Priority reason explanations
- [x] Responsive UI with Tailwind CSS

### 🔮 Future Enhancements (if time)
- [ ] WebSocket for instant updates (currently using polling)
- [ ] Completed orders history table
- [ ] Priority breakdown tooltip
- [ ] Sound alerts for urgent orders
- [ ] Custom order creation form
- [ ] Export metrics to CSV

---

## 🐛 Troubleshooting

### Backend won't start
- Check Java version: `java -version` (needs 17+)
- Kill any process on port 8080: `lsof -ti:8080 | xargs kill` (Mac/Linux)

### Frontend shows "Failed to fetch"
- Ensure backend is running on port 8080
- Check browser console for CORS errors
- Verify Vite proxy config in `vite.config.js`

### Baristas not assigning orders
- Check backend logs for errors
- Auto-simulation runs every 30 seconds
- Manually click "Simulate 1 Minute" to force update

---

## 👥 Team / Credits

Built for hackathon by [Your Team Name]

**Tech Decisions:**
- No database → Faster setup, live in-memory demo
- Polling over WebSocket → Simpler, more reliable for hackathon
- Tailwind CSS → Rapid UI development
- Vite over CRA → 10x faster hot reload

---

## 📄 License

MIT License - Free for hackathon use and modification

---

## 🙌 Acknowledgments

Inspired by:
- Swiggy/Zomato kitchen dashboards
- Modern queue management systems
- Priority scheduling algorithms

---

**Ready to impress judges? Run both servers and open localhost:3000! 🚀**
