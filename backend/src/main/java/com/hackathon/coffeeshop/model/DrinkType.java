package com.hackathon.coffeeshop.model;

/**
 * Types of coffee drinks with their preparation times and complexity scores
 */
public enum DrinkType {
    COLD_BREW("Cold Brew", 1.0, 10, "₹120"),
    ESPRESSO("Espresso", 2.0, 15, "₹150"),
    AMERICANO("Americano", 2.0, 12, "₹140"),
    CAPPUCCINO("Cappuccino", 4.0, 20, "₹180"),
    LATTE("Latte", 4.0, 18, "₹200"),
    MOCHA("Specialty (Mocha)", 6.0, 25, "₹250");

    private final String displayName;
    private final double preparationTime; // in minutes
    private final int complexityScore;    // for priority calculation
    private final String price;

    DrinkType(String displayName, double preparationTime, int complexityScore, String price) {
        this.displayName = displayName;
        this.preparationTime = preparationTime;
        this.complexityScore = complexityScore;
        this.price = price;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getPreparationTime() {
        return preparationTime;
    }

    public int getComplexityScore() {
        return complexityScore;
    }

    public String getPrice() {
        return price;
    }
}
