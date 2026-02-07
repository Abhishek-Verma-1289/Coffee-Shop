package com.hackathon.coffeeshop.model;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Core Order model with weighted priority calculation and fairness tracking
 * Priority formula: (wait_time × 40%) + (complexity × 25%) + (loyalty × 10%) + (urgency × 25%)
 */
public class Order {
    private static int orderCounter = 100;
    
    private int id;
    private DrinkType drinkType;
    private CustomerType customerType;
    private LocalDateTime orderTime;
    private double priorityScore;
    private String priorityReason;
    private Urgency urgency;
    private int peopleServedAhead;  // Fairness tracking
    private double estimatedWaitMinutes;
    private LocalDateTime completionTime;  // Track when order was completed

    public Order(DrinkType drinkType) {
        this.id = ++orderCounter;
        this.drinkType = drinkType;
        this.customerType = assignRandomCustomerType();
        this.orderTime = LocalDateTime.now();
        this.urgency = Urgency.NORMAL;
        this.peopleServedAhead = 0;
        recalculatePriority(LocalDateTime.now());
    }

    public Order(DrinkType drinkType, CustomerType customerType) {
        this.id = ++orderCounter;
        this.drinkType = drinkType;
        this.customerType = customerType;
        this.orderTime = LocalDateTime.now();
        this.urgency = Urgency.NORMAL;
        this.peopleServedAhead = 0;
        recalculatePriority(LocalDateTime.now());
    }

    /**
     * Weighted Priority Calculation (Exact specification)
     * Formula: (wait_time × 40%) + (complexity × 25%) + (loyalty × 10%) + (urgency × 25%)
     */
    public void recalculatePriority(LocalDateTime currentTime) {
        double waitTimeMinutes = getWaitTime(currentTime);
        double timeoutThreshold = customerType.getTimeoutMinutes();
        
        // 1. Wait Time Component (40% weight)
        // Scale: 0-10 minutes → 0-40 points
        double waitTimeScore = Math.min((waitTimeMinutes / 10.0) * 40.0, 40.0);
        
        // 2. Complexity Component (25% weight)
        // Inverse: shorter orders get higher score for throughput
        double maxPrepTime = 6.0; // Mocha is longest
        double complexityScore = ((maxPrepTime - drinkType.getPreparationTime()) / maxPrepTime) * 25.0;
        
        // 3. Loyalty Component (10% weight)
        double loyaltyScore = (customerType.getLoyaltyBonus() / 10.0) * 10.0;
        
        // 4. Urgency Component (25% weight)
        double urgencyScore = 0.0;
        double urgencyThreshold = timeoutThreshold - 2.0; // Start urgency 2 min before timeout
        
        if (waitTimeMinutes >= timeoutThreshold) {
            // CRITICAL: Exceeded timeout
            urgencyScore = 25.0;
            this.urgency = Urgency.URGENT;
            this.priorityReason = String.format("🚨 CRITICAL - Exceeded %s timeout (%.1f min)", 
                    customerType.getDisplayName(), timeoutThreshold);
        } else if (waitTimeMinutes >= urgencyThreshold) {
            // ELEVATED: Approaching timeout
            double urgencyRatio = (waitTimeMinutes - urgencyThreshold) / 2.0;
            urgencyScore = urgencyRatio * 25.0;
            this.urgency = Urgency.ELEVATED;
            this.priorityReason = String.format("⚠️ Approaching timeout - %.1f min remaining", 
                    timeoutThreshold - waitTimeMinutes);
        } else {
            // NORMAL: Safe zone
            this.urgency = Urgency.NORMAL;
            this.priorityReason = determineNormalReason(waitTimeMinutes);
        }
        
        // 5. Fairness Penalty
        // If >3 people have been served ahead, add penalty (reduce priority)
        double fairnessPenalty = 0.0;
        if (peopleServedAhead > 3) {
            fairnessPenalty = (peopleServedAhead - 3) * 2.0;  // -2 points per extra skip
            this.priorityReason += String.format(" | Fairness: %d skipped", peopleServedAhead);
        }
        
        // Total Priority Score (0-100 scale)
        this.priorityScore = Math.max(0, Math.min(100, 
                waitTimeScore + complexityScore + loyaltyScore + urgencyScore - fairnessPenalty));
    }

    private String determineNormalReason(double waitTime) {
        if (customerType == CustomerType.GOLD) {
            return "⭐ Gold member priority";
        } else if (drinkType.getPreparationTime() <= 2.0) {
            return "⚡ Quick order - throughput optimization";
        } else if (waitTime > 3.0) {
            return "⏱️ Wait time accumulating";
        } else {
            return "✅ Standard priority";
        }
    }

    private CustomerType assignRandomCustomerType() {
        // Distribution: 20% Gold, 60% Regular, 20% New
        double random = Math.random();
        if (random < 0.2) return CustomerType.GOLD;
        if (random < 0.8) return CustomerType.REGULAR;
        return CustomerType.NEW;
    }

    public double getWaitTime(LocalDateTime currentTime) {
        return ChronoUnit.SECONDS.between(orderTime, currentTime) / 60.0;
    }

    public void incrementPeopleServedAhead() {
        this.peopleServedAhead++;
    }

    public boolean isApproachingTimeout(LocalDateTime currentTime) {
        double waitTime = getWaitTime(currentTime);
        return waitTime >= (customerType.getTimeoutMinutes() - 2.0);
    }

    public boolean hasExceededTimeout(LocalDateTime currentTime) {
        return getWaitTime(currentTime) >= customerType.getTimeoutMinutes();
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public DrinkType getDrinkType() {
        return drinkType;
    }

    public CustomerType getCustomerType() {
        return customerType;
    }

    public LocalDateTime getOrderTime() {
        return orderTime;
    }

    public double getPriorityScore() {
        return priorityScore;
    }

    public String getPriorityReason() {
        return priorityReason;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public int getPeopleServedAhead() {
        return peopleServedAhead;
    }

    public double getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(double estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public void setPriorityScore(double priorityScore) {
        this.priorityScore = priorityScore;
    }

    public LocalDateTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalDateTime completionTime) {
        this.completionTime = completionTime;
    }

    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }

    /**
     * Check if this order is a complaint (exceeded 10 min threshold)
     */
    public boolean isComplaint() {
        if (completionTime == null) {
            return false;
        }
        double totalTime = getTotalCompletionTime();
        return totalTime > 10.0;
    }

    /**
     * Get total time from order creation to completion (in minutes)
     */
    public double getTotalCompletionTime() {
        if (completionTime == null || orderTime == null) {
            return 0.0;
        }
        long seconds = ChronoUnit.SECONDS.between(orderTime, completionTime);
        return seconds / 60.0;
    }

    @Override
    public String toString() {
        return String.format("Order #%d: %s (%s) - Priority: %.1f, Wait: %.1f min",
                id, drinkType.getDisplayName(), customerType.getDisplayName(), 
                priorityScore, getWaitTime(LocalDateTime.now()));
    }
}
