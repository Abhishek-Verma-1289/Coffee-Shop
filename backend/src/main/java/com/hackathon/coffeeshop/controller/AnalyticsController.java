package com.hackathon.coffeeshop.controller;

import com.hackathon.coffeeshop.service.AnalyticsService;
import com.hackathon.coffeeshop.service.BaristaService;
import com.hackathon.coffeeshop.service.QueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST API for Analytics and Statistics
 * Provides detailed insights on order completion, complaints, and barista workload
 */
@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    private final QueueService queueService;
    private final BaristaService baristaService;

    public AnalyticsController(AnalyticsService analyticsService, 
                               QueueService queueService,
                               BaristaService baristaService) {
        this.analyticsService = analyticsService;
        this.queueService = queueService;
        this.baristaService = baristaService;
    }

    /**
     * GET /analytics/stats
     * Get comprehensive statistics including:
     * - Average order completion time
     * - Total complaints (orders exceeding 10 min)
     * - Per-barista average workload
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDetailedStats() {
        Map<String, Object> stats = analyticsService.getDetailedStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * POST /analytics/test100
     * Generate 100 random orders and complete them instantly for testing
     */
    @PostMapping("/test100")
    public ResponseEntity<Map<String, Object>> generateTest100Orders() {
        int ordersAdded = analyticsService.generateBulkOrders(100);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("ordersGenerated", ordersAdded);
        response.put("ordersCompleted", ordersAdded);
        response.put("message", String.format("Successfully generated and completed %d test orders", ordersAdded));
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /analytics/rush-hour-100
     * Simulate rush hour with 100 orders using SMART priority algorithm
     */
    @PostMapping("/rush-hour-100")
    public ResponseEntity<Map<String, Object>> simulateRushHour100() {
        Map<String, Object> rushHourStats = analyticsService.simulateRushHour200Orders();
        return ResponseEntity.ok(rushHourStats);
    }

    /**
     * GET /analytics/barista-breakdown
     * Get per-barista detailed breakdown
     */
    @GetMapping("/barista-breakdown")
    public ResponseEntity<Map<String, Object>> getBaristaBreakdown() {
        Map<String, Object> breakdown = analyticsService.getBaristaWorkloadBreakdown();
        return ResponseEntity.ok(breakdown);
    }

    /**
     * GET /analytics/last100
     * Get statistics based on last 100 completed orders
     */
    @GetMapping("/last100")
    public ResponseEntity<Map<String, Object>> getLast100Stats() {
        Map<String, Object> stats = analyticsService.getLast100OrderStats();
        return ResponseEntity.ok(stats);
    }
}
