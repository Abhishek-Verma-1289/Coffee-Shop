package com.hackathon.coffeeshop.model;

/**
 * Customer types with different timeout thresholds
 */
public enum CustomerType {
    GOLD("Gold Member", 10.0, 10),      // 10 min timeout, 10% loyalty bonus
    REGULAR("Regular", 10.0, 0),         // 10 min timeout, no bonus
    NEW("New Customer", 8.0, 0);         // 8 min timeout, no bonus

    private final String displayName;
    private final double timeoutMinutes;
    private final int loyaltyBonus;

    CustomerType(String displayName, double timeoutMinutes, int loyaltyBonus) {
        this.displayName = displayName;
        this.timeoutMinutes = timeoutMinutes;
        this.loyaltyBonus = loyaltyBonus;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getTimeoutMinutes() {
        return timeoutMinutes;
    }

    public int getLoyaltyBonus() {
        return loyaltyBonus;
    }
}
