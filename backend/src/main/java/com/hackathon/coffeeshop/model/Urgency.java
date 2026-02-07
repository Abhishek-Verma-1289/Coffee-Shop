package com.hackathon.coffeeshop.model;

/**
 * Urgency levels for orders based on wait time
 */
public enum Urgency {
    NORMAL,    // 0-5 minutes
    ELEVATED,  // 5-8 minutes
    URGENT     // 8+ minutes
}
