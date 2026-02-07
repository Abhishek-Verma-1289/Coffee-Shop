package com.hackathon.coffeeshop.controller;

import com.hackathon.coffeeshop.service.BaristaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for Barista Status
 */
@RestController
@RequestMapping("/baristas")
@CrossOrigin(origins = "http://localhost:3000")
public class BaristaController {
    
    private final BaristaService baristaService;

    public BaristaController(BaristaService baristaService) {
        this.baristaService = baristaService;
    }

    /**
     * GET /baristas/status
     * Returns status of all baristas
     */
    @GetMapping("/status")
    public ResponseEntity<List<Map<String, Object>>> getBaristaStatus() {
        List<Map<String, Object>> status = baristaService.getBaristaStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * GET /baristas/stats
     * Returns barista statistics (free/busy count)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Integer>> getBaristaStats() {
        Map<String, Integer> stats = baristaService.getBaristaStats();
        return ResponseEntity.ok(stats);
    }
}
