package com.hackathon.coffeeshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Smart Coffee Queue Management System
 * Main application entry point
 */
@SpringBootApplication
@EnableScheduling
public class CoffeeShopApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(CoffeeShopApplication.class, args);
        System.out.println("☕ Coffee Shop API is running on http://localhost:8081");
    }
}
