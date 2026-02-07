package com.hackathon.coffeeshop.controller;

import com.hackathon.coffeeshop.model.DrinkType;
import com.hackathon.coffeeshop.model.Order;
import com.hackathon.coffeeshop.service.QueueService;
import com.hackathon.coffeeshop.service.BaristaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST API for Order Management
 */
@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    
    private final QueueService queueService;
    private final BaristaService baristaService;

    public OrderController(QueueService queueService, BaristaService baristaService) {
        this.queueService = queueService;
        this.baristaService = baristaService;
    }

    /**
     * GET /orders/queue
     * Returns current order queue with priorities
     */
    @GetMapping("/queue")
    public ResponseEntity<List<Map<String, Object>>> getQueue() {
        List<Order> orders = queueService.getQueueOrders();
        
        List<Map<String, Object>> orderData = orders.stream()
                .map(this::orderToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(orderData);
    }

    /**
     * POST /orders/random
     * Add a random order to the queue
     */
    @PostMapping("/random")
    public ResponseEntity<Map<String, Object>> addRandomOrder() {
        Order order = queueService.addRandomOrder();
        baristaService.assignOrders(); // Try to assign immediately
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", orderToMap(order));
        response.put("message", String.format("Added Order #%d: %s", 
                order.getId(), order.getDrinkType().getDisplayName()));
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /orders/create
     * Add a specific drink type
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, String> request) {
        try {
            String drinkName = request.get("drinkType");
            DrinkType drinkType = DrinkType.valueOf(drinkName.toUpperCase().replace(" ", "_"));
            
            Order order = queueService.addOrder(drinkType);
            baristaService.assignOrders();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", orderToMap(order));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid drink type");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Convert Order model to JSON-friendly map (with new fields)
     */
    private Map<String, Object> orderToMap(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("drinkType", order.getDrinkType().getDisplayName());
        map.put("waitTime", Math.round(order.getWaitTime(queueService.getSimulatedTime()) * 10) / 10.0);
        map.put("priority", order.getPriorityScore());
        map.put("reason", order.getPriorityReason());
        map.put("urgency", order.getUrgency().toString().toLowerCase());
        map.put("customerType", order.getCustomerType().getDisplayName());
        map.put("peopleServedAhead", order.getPeopleServedAhead());
        map.put("estimatedWaitMinutes", Math.round(order.getEstimatedWaitMinutes() * 10) / 10.0);
        return map;
    }
}
