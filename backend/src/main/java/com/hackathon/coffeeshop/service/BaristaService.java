package com.hackathon.coffeeshop.service;

import com.hackathon.coffeeshop.model.Barista;
import com.hackathon.coffeeshop.model.Order;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Barista Management Service with Workload Balancing
 * Implements load balancing: overloaded baristas prefer quick orders
 */
@Service
public class BaristaService {
    
    private final List<Barista> baristas = new ArrayList<>();
    private final QueueService queueService;
    
    public BaristaService(QueueService queueService) {
        this.queueService = queueService;
        
        // Initialize 3 baristas
        baristas.add(new Barista(1, "Barista 1"));
        baristas.add(new Barista(2, "Barista 2"));
        baristas.add(new Barista(3, "Barista 3"));
    }

    /**
     * Automatically assign orders to free baristas with workload balancing
     */
    public void assignOrders() {
        LocalDateTime currentTime = queueService.getSimulatedTime();
        double averageWorkMinutes = calculateAverageWorkload();
        
        // Check if any baristas are free
        List<Barista> freeBaristas = baristas.stream()
                .filter(Barista::isFree)
                .collect(Collectors.toList());
        
        // Assign orders to free baristas (with workload consideration)
        for (Barista barista : freeBaristas) {
            Order nextOrder = queueService.getNextOrder(barista, averageWorkMinutes);
            if (nextOrder != null) {
                barista.assignOrder(nextOrder, currentTime);
                System.out.println(String.format("✅ %s assigned Order #%d (%s) - %s customer - Priority: %.1f",
                        barista.getName(), nextOrder.getId(), nextOrder.getDrinkType().getDisplayName(),
                        nextOrder.getCustomerType().getDisplayName(), nextOrder.getPriorityScore()));
            }
        }
    }

    /**
     * Calculate average workload across all baristas
     */
    private double calculateAverageWorkload() {
        double totalWork = baristas.stream()
                .mapToDouble(Barista::getTotalWorkMinutes)
                .sum();
        return totalWork / baristas.size();
    }

    /**
     * Check and complete finished orders
     * Called every minute by scheduler
     */
    public void checkCompletedOrders() {
        LocalDateTime currentTime = queueService.getSimulatedTime();
        
        for (Barista barista : baristas) {
            if (!barista.isFree()) {
                double timeRemaining = barista.getTimeRemaining(currentTime);
                
                if (timeRemaining <= 0) {
                    // Order is complete
                    Order completedOrder = barista.getCurrentOrder();
                    System.out.println(String.format("✅ %s completed Order #%d - Wait time: %.1f min",
                            barista.getName(), completedOrder.getId(), 
                            completedOrder.getWaitTime(currentTime)));
                    
                    queueService.completeOrder(completedOrder);
                    barista.completeOrder();
                }
            }
        }
        
        // After completing orders, try to assign new ones
        assignOrders();
    }

    /**
     * Get status of all baristas for UI (with workload info)
     */
    public List<Map<String, Object>> getBaristaStatus() {
        LocalDateTime currentTime = queueService.getSimulatedTime();
        double averageWorkload = calculateAverageWorkload();
        
        return baristas.stream()
                .map(barista -> {
                    Map<String, Object> status = new HashMap<>();
                    status.put("id", barista.getId());
                    status.put("name", barista.getName());
                    status.put("status", barista.getStatus().toString());
                    status.put("workloadRatio", Math.round(barista.getWorkloadRatio(averageWorkload) * 100) / 100.0);
                    status.put("totalWorkMinutes", Math.round(barista.getTotalWorkMinutes() * 10) / 10.0);
                    status.put("ordersCompleted", barista.getOrdersCompleted());
                    
                    if (!barista.isFree() && barista.getCurrentOrder() != null) {
                        Order currentOrder = barista.getCurrentOrder();
                        status.put("currentOrder", currentOrder.getDrinkType().getDisplayName());
                        status.put("orderId", currentOrder.getId());
                        status.put("customerType", currentOrder.getCustomerType().getDisplayName());
                        status.put("timeRemaining", Math.round(barista.getTimeRemaining(currentTime) * 10) / 10.0);
                    } else {
                        status.put("currentOrder", null);
                        status.put("timeRemaining", 0.0);
                    }
                    
                    return status;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get count of free vs busy baristas
     */
    public Map<String, Integer> getBaristaStats() {
        Map<String, Integer> stats = new HashMap<>();
        long freeCount = baristas.stream().filter(Barista::isFree).count();
        long busyCount = baristas.size() - freeCount;
        
        stats.put("total", baristas.size());
        stats.put("free", (int) freeCount);
        stats.put("busy", (int) busyCount);
        
        return stats;
    }

    /**
     * Force complete all current orders (for testing)
     */
    public void completeAllOrders() {
        baristas.forEach(barista -> {
            if (!barista.isFree()) {
                queueService.completeOrder(barista.getCurrentOrder());
                barista.completeOrder();
            }
        });
    }

    public List<Barista> getAllBaristas() {
        return baristas;
    }
}
