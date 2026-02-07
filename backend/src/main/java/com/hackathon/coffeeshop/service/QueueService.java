package com.hackathon.coffeeshop.service;

import com.hackathon.coffeeshop.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

/**
 * Core Queue Management Service with Fairness Tracking
 * Implements weighted priority system (40/25/10/25) and fairness enforcement
 */
@Service
public class QueueService {
    
    private final Queue<Order> orderQueue = new ConcurrentLinkedQueue<>();
    private final List<Order> completedOrders = new ArrayList<>();
    private QueueMode currentMode = QueueMode.SMART;
    private LocalDateTime simulatedTime = LocalDateTime.now();
    
    // Metrics tracking
    private int totalOrders = 0;
    private int timeoutOrders = 0;
    private int fairnessViolations = 0;  // Track when fairness is violated
    
    // Poisson arrival simulation
    private boolean autoArrivalEnabled = false;
    private double lambda = 1.4;  // 1.4 customers per minute

    /**
     * Add a new order to the queue
     */
    public Order addOrder(DrinkType drinkType) {
        Order order = new Order(drinkType);
        order.recalculatePriority(simulatedTime);
        orderQueue.offer(order);
        totalOrders++;
        return order;
    }

    /**
     * Add order with specific customer type
     */
    public Order addOrder(DrinkType drinkType, CustomerType customerType) {
        Order order = new Order(drinkType, customerType);
        order.recalculatePriority(simulatedTime);
        orderQueue.offer(order);
        totalOrders++;
        return order;
    }

    /**
     * Add a random order (for simulation)
     */
    public Order addRandomOrder() {
        DrinkType[] drinks = DrinkType.values();
        DrinkType randomDrink = drinks[new Random().nextInt(drinks.length)];
        return addOrder(randomDrink);
    }

    /**
     * Get the next order based on current mode (FIFO or SMART) with workload consideration
     */
    public Order getNextOrder(Barista barista, double averageWorkMinutes) {
        if (orderQueue.isEmpty()) {
            return null;
        }

        if (currentMode == QueueMode.FIFO) {
            // Simple FIFO: first in, first out
            return orderQueue.poll();
        } else {
            // SMART mode with workload balancing
            recalculateAllPriorities();
            calculateEstimatedWaitTimes();
            
            List<Order> sortedOrders = orderQueue.stream()
                    .sorted(Comparator.comparingDouble(Order::getPriorityScore).reversed())
                    .collect(Collectors.toList());
            
            if (sortedOrders.isEmpty()) return null;
            
            Order selectedOrder;
            
            // Workload balancing logic
            if (barista.isOverloaded(averageWorkMinutes)) {
                // Overloaded barista: prefer quick orders (<3 min)
                selectedOrder = sortedOrders.stream()
                        .filter(o -> o.getDrinkType().getPreparationTime() <= 3.0)
                        .findFirst()
                        .orElse(sortedOrders.get(0));  // Fallback to highest priority
                        
                System.out.println(String.format("⚖️ %s overloaded (%.1fx) - assigned quick order", 
                        barista.getName(), barista.getWorkloadRatio(averageWorkMinutes)));
                        
            } else if (barista.isUnderutilized(averageWorkMinutes)) {
                // Underutilized barista: can take complex orders
                selectedOrder = sortedOrders.stream()
                        .filter(o -> o.getDrinkType().getPreparationTime() >= 4.0)
                        .findFirst()
                        .orElse(sortedOrders.get(0));
                        
                System.out.println(String.format("⚖️ %s underutilized (%.1fx) - assigned complex order", 
                        barista.getName(), barista.getWorkloadRatio(averageWorkMinutes)));
                        
            } else {
                // Balanced: take highest priority
                selectedOrder = sortedOrders.get(0);
            }
            
            // Update fairness tracking for orders that got skipped
            for (Order order : sortedOrders) {
                if (order.getId() < selectedOrder.getId() && order != selectedOrder) {
                    order.incrementPeopleServedAhead();
                    if (order.getPeopleServedAhead() > 3) {
                        fairnessViolations++;
                    }
                }
            }
            
            orderQueue.remove(selectedOrder);
            return selectedOrder;
        }
    }

    /**
     * Get current queue in display order
     */
    public List<Order> getQueueOrders() {
        recalculateAllPriorities();
        calculateEstimatedWaitTimes();
        
        if (currentMode == QueueMode.FIFO) {
            return new ArrayList<>(orderQueue);
        } else {
            // SMART mode: show sorted by priority (highest first)
            return orderQueue.stream()
                    .sorted(Comparator.comparingDouble(Order::getPriorityScore).reversed())
                    .collect(Collectors.toList());
        }
    }

    /**
     * Get completed orders list (for analytics)
     */
    public List<Order> getCompletedOrders() {
        return new ArrayList<>(completedOrders);
    }

    /**
     * Recalculate priorities for all orders in queue
     * Called every 30 seconds by scheduler
     */
    public void recalculateAllPriorities() {
        orderQueue.forEach(order -> order.recalculatePriority(simulatedTime));
    }

    /**
     * Calculate estimated wait times based on barista availability
     */
    private void calculateEstimatedWaitTimes() {
        List<Order> sorted = orderQueue.stream()
                .sorted(Comparator.comparingDouble(Order::getPriorityScore).reversed())
                .collect(Collectors.toList());
        
        double cumulativeTime = 0.0;
        for (Order order : sorted) {
            cumulativeTime += order.getDrinkType().getPreparationTime();
            order.setEstimatedWaitMinutes(cumulativeTime / 3.0);  // Divided by 3 baristas
        }
    }

    /**
     * Complete an order (move from queue to completed)
     */
    public void completeOrder(Order order) {
        if (order != null) {
            order.setCompletionTime(simulatedTime);  // Track completion time
            double waitTime = order.getWaitTime(simulatedTime);
            if (waitTime > order.getCustomerType().getTimeoutMinutes()) {
                timeoutOrders++;
            }
            completedOrders.add(order);
        }
    }

    /**
     * Switch queue mode (FIFO <-> SMART)
     */
    public void setQueueMode(QueueMode mode) {
        this.currentMode = mode;
    }

    public QueueMode getCurrentMode() {
        return currentMode;
    }

    /**
     * Advance simulated time by X minutes
     */
    public void advanceTime(int minutes) {
        simulatedTime = simulatedTime.plusMinutes(minutes);
        recalculateAllPriorities();
        
        // Poisson arrival simulation (if enabled)
        if (autoArrivalEnabled) {
            simulatePoissonArrivals(minutes);
        }
    }

    /**
     * Simulate customer arrivals using Poisson distribution
     * λ = 1.4 customers/minute
     */
    private void simulatePoissonArrivals(int minutes) {
        Random random = new Random();
        for (int i = 0; i < minutes; i++) {
            // Poisson: P(k events) = (λ^k * e^-λ) / k!
            // Simplified: average λ arrivals per minute with random variation
            double arrivals = -Math.log(1.0 - random.nextDouble()) * lambda;
            int numArrivals = (int) Math.round(arrivals);
            
            for (int j = 0; j < numArrivals; j++) {
                addRandomOrder();
            }
            
            if (numArrivals > 0) {
                System.out.println(String.format("📥 Poisson arrival: %d customers in minute %d", 
                        numArrivals, i + 1));
            }
        }
    }

    /**
     * Get metrics for dashboard
     */
    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        double avgWaitTime = 0.0;
        double maxWaitTime = 0.0;
        
        if (!completedOrders.isEmpty()) {
            avgWaitTime = completedOrders.stream()
                    .mapToDouble(o -> o.getWaitTime(simulatedTime))
                    .average()
                    .orElse(0.0);
            
            maxWaitTime = completedOrders.stream()
                    .mapToDouble(o -> o.getWaitTime(simulatedTime))
                    .max()
                    .orElse(0.0);
        }
        
        double timeoutRate = totalOrders > 0 
                ? (timeoutOrders * 100.0 / totalOrders) 
                : 0.0;
        
        double fairnessViolationRate = totalOrders > 0
                ? (fairnessViolations * 100.0 / totalOrders)
                : 0.0;
        
        metrics.put("avgWaitTime", Math.round(avgWaitTime * 10) / 10.0);
        metrics.put("maxWaitTime", Math.round(maxWaitTime * 10) / 10.0);
        metrics.put("timeoutRate", Math.round(timeoutRate * 10) / 10.0);
        metrics.put("fairnessViolationRate", Math.round(fairnessViolationRate * 10) / 10.0);
        metrics.put("queueLength", orderQueue.size());
        metrics.put("completedOrders", completedOrders.size());
        metrics.put("totalOrders", totalOrders);
        metrics.put("currentMode", currentMode);
        metrics.put("autoArrivalEnabled", autoArrivalEnabled);
        
        return metrics;
    }

    /**
     * Simulate rush hour (add multiple orders quickly)
     */
    public List<Order> simulateRushHour() {
        List<Order> rushOrders = new ArrayList<>();
        Random random = new Random();
        
        // Add 5-8 random orders
        int orderCount = 5 + random.nextInt(4);
        for (int i = 0; i < orderCount; i++) {
            rushOrders.add(addRandomOrder());
        }
        
        return rushOrders;
    }

    /**
     * Toggle Poisson auto-arrival
     */
    public void setAutoArrivalEnabled(boolean enabled) {
        this.autoArrivalEnabled = enabled;
    }

    /**
     * Alias for setAutoArrivalEnabled (for API clarity)
     */
    public void setPoissonEnabled(boolean enabled) {
        this.autoArrivalEnabled = enabled;
    }

    public boolean isAutoArrivalEnabled() {
        return autoArrivalEnabled;
    }

    /**
     * Reset entire system
     */
    public void reset() {
        orderQueue.clear();
        completedOrders.clear();
        totalOrders = 0;
        timeoutOrders = 0;
        fairnessViolations = 0;
        simulatedTime = LocalDateTime.now();
        currentMode = QueueMode.SMART;
        autoArrivalEnabled = false;
    }

    public LocalDateTime getSimulatedTime() {
        return simulatedTime;
    }

    public int getQueueSize() {
        return orderQueue.size();
    }
}
