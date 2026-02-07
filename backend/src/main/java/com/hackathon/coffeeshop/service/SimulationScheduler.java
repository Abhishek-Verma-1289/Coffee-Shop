package com.hackathon.coffeeshop.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Time Simulation Scheduler
 * Automatically advances time and processes orders
 */
@Service
public class SimulationScheduler {
    
    private final QueueService queueService;
    private final BaristaService baristaService;
    private boolean autoMode = true; // Toggle for demo control

    public SimulationScheduler(QueueService queueService, BaristaService baristaService) {
        this.queueService = queueService;
        this.baristaService = baristaService;
    }

    /**
     * Main simulation loop - runs every 30 seconds
     * Advances time by 1 minute and processes orders
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void simulateMinute() {
        if (!autoMode) {
            return; // Paused for manual demo control
        }

        // Advance simulated time by 1 minute
        queueService.advanceTime(1);
        
        // Recalculate priorities (older orders get higher priority)
        queueService.recalculateAllPriorities();
        
        // Check if any baristas finished their orders
        baristaService.checkCompletedOrders();
        
        // Try to assign orders to free baristas
        baristaService.assignOrders();
        
        // Log current state
        int queueSize = queueService.getQueueSize();
        if (queueSize > 0) {
            System.out.println(String.format("⏱️  Simulated 1 minute | Queue: %d orders", queueSize));
        }
    }

    /**
     * Manually trigger one minute simulation (for demo button)
     */
    public void manualSimulateMinute() {
        simulateMinute();
    }

    /**
     * Toggle auto-simulation on/off
     */
    public void setAutoMode(boolean enabled) {
        this.autoMode = enabled;
        System.out.println("Auto-simulation " + (enabled ? "ENABLED" : "DISABLED"));
    }

    public boolean isAutoMode() {
        return autoMode;
    }
}
