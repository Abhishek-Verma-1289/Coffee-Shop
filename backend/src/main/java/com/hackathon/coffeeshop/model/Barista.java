package com.hackathon.coffeeshop.model;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Barista model with workload tracking for load balancing
 */
public class Barista {
    private int id;
    private String name;
    private BaristaStatus status;
    private Order currentOrder;
    private LocalDateTime taskStartTime;
    private double totalWorkMinutes;  // For workload calculation
    private int ordersCompleted;

    public Barista(int id, String name) {
        this.id = id;
        this.name = name;
        this.status = BaristaStatus.FREE;
        this.totalWorkMinutes = 0.0;
        this.ordersCompleted = 0;
    }

    public void assignOrder(Order order, LocalDateTime currentTime) {
        this.currentOrder = order;
        this.status = BaristaStatus.BUSY;
        this.taskStartTime = currentTime;
    }

    public void completeOrder() {
        if (currentOrder != null) {
            this.totalWorkMinutes += currentOrder.getDrinkType().getPreparationTime();
            this.ordersCompleted++;
        }
        this.currentOrder = null;
        this.status = BaristaStatus.FREE;
        this.taskStartTime = null;
    }

    public double getTimeRemaining(LocalDateTime currentTime) {
        if (currentOrder == null || taskStartTime == null) {
            return 0.0;
        }
        double elapsedMinutes = ChronoUnit.SECONDS.between(taskStartTime, currentTime) / 60.0;
        double remaining = currentOrder.getDrinkType().getPreparationTime() - elapsedMinutes;
        return Math.max(0, remaining);
    }

    /**
     * Calculate workload ratio compared to average
     * Used for load balancing: overloaded baristas prefer quick orders
     */
    public double getWorkloadRatio(double averageWorkMinutes) {
        if (averageWorkMinutes == 0) return 1.0;
        return totalWorkMinutes / averageWorkMinutes;
    }

    public boolean isOverloaded(double averageWorkMinutes) {
        return getWorkloadRatio(averageWorkMinutes) > 1.2;
    }

    public boolean isUnderutilized(double averageWorkMinutes) {
        return getWorkloadRatio(averageWorkMinutes) < 0.8;
    }

    public boolean isFree() {
        return status == BaristaStatus.FREE;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BaristaStatus getStatus() {
        return status;
    }

    public Order getCurrentOrder() {
        return currentOrder;
    }

    public LocalDateTime getTaskStartTime() {
        return taskStartTime;
    }

    public double getTotalWorkMinutes() {
        return totalWorkMinutes;
    }

    public int getOrdersCompleted() {
        return ordersCompleted;
    }

    public enum BaristaStatus {
        FREE, BUSY
    }
}
