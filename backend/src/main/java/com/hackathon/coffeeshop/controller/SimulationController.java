package com.hackathon.coffeeshop.controller;

import com.hackathon.coffeeshop.model.Order;
import com.hackathon.coffeeshop.model.QueueMode;
import com.hackathon.coffeeshop.service.BaristaService;
import com.hackathon.coffeeshop.service.QueueService;
import com.hackathon.coffeeshop.service.SimulationScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API for Simulation Controls and Metrics
 */
@RestController
@RequestMapping("/simulate")
@CrossOrigin(origins = "http://localhost:3000")
public class SimulationController {
    
    private final QueueService queueService;
    private final BaristaService baristaService;
    private final SimulationScheduler scheduler;

    public SimulationController(QueueService queueService, 
                                BaristaService baristaService, 
                                SimulationScheduler scheduler) {
        this.queueService = queueService;
        this.baristaService = baristaService;
        this.scheduler = scheduler;
    }

    /**
     * POST /simulate/minute
     * Manually advance time by 1 minute
     */
    @PostMapping("/minute")
    public ResponseEntity<Map<String, Object>> simulateMinute() {
        scheduler.manualSimulateMinute();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Advanced 1 minute");
        response.put("queueSize", queueService.getQueueSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /simulate/rush
     * Trigger rush hour (add multiple orders)
     */
    @PostMapping("/rush")
    public ResponseEntity<Map<String, Object>> triggerRushHour() {
        List<Order> rushOrders = queueService.simulateRushHour();
        baristaService.assignOrders();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", String.format("Rush hour! Added %d orders", rushOrders.size()));
        response.put("ordersAdded", rushOrders.size());
        response.put("queueSize", queueService.getQueueSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /simulate/reset
     * Reset entire system
     */
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetSystem() {
        queueService.reset();
        baristaService.completeAllOrders();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "System reset complete");
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /simulate/auto
     * Toggle auto-simulation on/off
     */
    @PostMapping("/auto")
    public ResponseEntity<Map<String, Object>> toggleAutoMode(@RequestBody Map<String, Boolean> request) {
        boolean enabled = request.getOrDefault("enabled", true);
        scheduler.setAutoMode(enabled);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("autoMode", enabled);
        response.put("message", "Auto-simulation " + (enabled ? "enabled" : "disabled"));
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /simulate/poisson
     * Toggle Poisson arrivals on/off
     */
    @PostMapping("/poisson")
    public ResponseEntity<Map<String, Object>> togglePoissonArrivals(@RequestBody Map<String, Boolean> request) {
        boolean enabled = request.getOrDefault("enabled", true);
        queueService.setPoissonEnabled(enabled);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("poissonEnabled", enabled);
        response.put("message", "Poisson arrivals " + (enabled ? "enabled (λ=1.4)" : "disabled"));
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /simulate/metrics
     * Get performance metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = queueService.getMetrics();
        
        // Add barista stats
        Map<String, Integer> baristaStats = baristaService.getBaristaStats();
        metrics.put("activeOrders", baristaStats.get("busy"));
        
        return ResponseEntity.ok(metrics);
    }

    /**
     * POST /simulate/mode
     * Switch queue mode (FIFO <-> SMART)
     */
    @PostMapping("/mode")
    public ResponseEntity<Map<String, Object>> switchMode(@RequestBody Map<String, String> request) {
        String modeStr = request.get("mode");
        QueueMode mode = QueueMode.valueOf(modeStr.toUpperCase());
        queueService.setQueueMode(mode);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("currentMode", mode.toString());
        response.put("message", String.format("Switched to %s mode", mode));
        
        return ResponseEntity.ok(response);
    }
}
