# 📡 API Reference Card

**Base URL:** `http://localhost:8080`

## 🛍️ Order Endpoints

### Get Order Queue
```http
GET /orders/queue
```
**Response:**
```json
[
  {
    "id": 101,
    "drinkType": "Cold Brew",
    "waitTime": 6.5,
    "priority": 78,
    "reason": "☕ Complex drink - elevated priority",
    "urgency": "elevated"
  }
]
```

---

### Add Random Order
```http
POST /orders/random
```
**Response:**
```json
{
  "success": true,
  "message": "Added Order #102: Cappuccino",
  "order": { /* order object */ }
}
```

---

### Create Specific Order
```http
POST /orders/create
Content-Type: application/json

{
  "drinkType": "ESPRESSO"
}
```
**Valid drink types:**
- `ESPRESSO` (2 min)
- `AMERICANO` (2.5 min)
- `CAPPUCCINO` (3 min)
- `LATTE` (3.5 min)
- `MOCHA` (4 min)
- `COLD_BREW` (5 min)
- `FRAPPE` (4.5 min)

---

## 👨‍🍳 Barista Endpoints

### Get Barista Status
```http
GET /baristas/status
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Barista 1",
    "status": "BUSY",
    "currentOrder": "Cappuccino",
    "orderId": 101,
    "timeRemaining": 2.3
  },
  {
    "id": 2,
    "name": "Barista 2",
    "status": "FREE",
    "currentOrder": null,
    "timeRemaining": 0.0
  }
]
```

---

### Get Barista Stats
```http
GET /baristas/stats
```
**Response:**
```json
{
  "total": 3,
  "free": 1,
  "busy": 2
}
```

---

## 🎮 Simulation Endpoints

### Simulate 1 Minute
```http
POST /simulate/minute
```
Advances simulated time by 1 minute, recalculates priorities, checks for completed orders.

**Response:**
```json
{
  "success": true,
  "message": "Advanced 1 minute",
  "queueSize": 5
}
```

---

### Trigger Rush Hour
```http
POST /simulate/rush
```
Adds 5-8 random orders instantly.

**Response:**
```json
{
  "success": true,
  "message": "Rush hour! Added 7 orders",
  "ordersAdded": 7,
  "queueSize": 12
}
```

---

### Reset System
```http
POST /simulate/reset
```
Clears all orders, resets baristas, resets metrics.

**Response:**
```json
{
  "success": true,
  "message": "System reset complete"
}
```

---

### Switch Queue Mode
```http
POST /simulate/mode
Content-Type: application/json

{
  "mode": "SMART"
}
```
**Valid modes:** `FIFO` | `SMART`

**Response:**
```json
{
  "success": true,
  "currentMode": "SMART",
  "message": "Switched to SMART mode"
}
```

---

### Toggle Auto-Simulation
```http
POST /simulate/auto
Content-Type: application/json

{
  "enabled": true
}
```
Turns on/off the 30-second automatic time progression.

**Response:**
```json
{
  "success": true,
  "autoMode": true,
  "message": "Auto-simulation enabled"
}
```

---

### Get Metrics
```http
GET /simulate/metrics
```
**Response:**
```json
{
  "avgWaitTime": 5.3,
  "maxWaitTime": 8.5,
  "timeoutRate": 2.1,
  "queueLength": 7,
  "completedOrders": 45,
  "totalOrders": 52,
  "activeOrders": 3,
  "currentMode": "SMART"
}
```

---

## 🧪 Testing with cURL

### Add 5 Random Orders
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8080/orders/random
done
```

### Switch to FIFO Mode
```bash
curl -X POST http://localhost:8080/simulate/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "FIFO"}'
```

### Simulate Rush Hour
```bash
curl -X POST http://localhost:8080/simulate/rush
```

### Get Current State
```bash
# Get queue
curl http://localhost:8080/orders/queue | jq

# Get baristas
curl http://localhost:8080/baristas/status | jq

# Get metrics
curl http://localhost:8080/simulate/metrics | jq
```

---

## 🔄 Common Workflows

### Demo Flow
```bash
# 1. Start in FIFO mode
curl -X POST http://localhost:8080/simulate/mode \
  -d '{"mode": "FIFO"}'

# 2. Add rush hour
curl -X POST http://localhost:8080/simulate/rush

# 3. Simulate 5 minutes
for i in {1..5}; do
  curl -X POST http://localhost:8080/simulate/minute
  sleep 1
done

# 4. Switch to SMART mode
curl -X POST http://localhost:8080/simulate/mode \
  -d '{"mode": "SMART"}'

# 5. Check metrics improvement
curl http://localhost:8080/simulate/metrics | jq
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad request (invalid drink type) |
| 500  | Server error |

---

## 🔧 CORS Configuration

Frontend allowed origins:
- `http://localhost:3000`

If running frontend on different port, update `WebConfig.java`:
```java
.allowedOrigins("http://localhost:YOUR_PORT")
```

---

## 🚀 API Performance

- Average response time: **< 5ms**
- Concurrent requests: **Thread-safe**
- Rate limit: **None (add Spring Cloud Gateway for production)**

---

## 💡 Pro Tips

### Testing Priority Changes
```bash
# Add an order
ORDER_ID=$(curl -s -X POST http://localhost:8080/orders/random | jq -r '.order.id')

# Wait and check priority increase
curl http://localhost:8080/orders/queue | jq ".[] | select(.id == $ORDER_ID)"
curl -X POST http://localhost:8080/simulate/minute
curl http://localhost:8080/orders/queue | jq ".[] | select(.id == $ORDER_ID)"
```

### Debugging
```bash
# Check backend logs
tail -f backend/logs/spring-boot-app.log

# Check CORS issues
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8080/orders/random -v
```

---

**Quick Start:** Open http://localhost:8080 in browser to verify backend is running!
