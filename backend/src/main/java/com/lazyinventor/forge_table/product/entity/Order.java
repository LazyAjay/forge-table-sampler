package com.lazyinventor.forge_table.product.entity;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Data
@Entity
@Table(name = "customer_order") // 'order' is a reserved SQL word, so we rename the table to avoid syntax issues in H2!
public class Order {

    @Id
    private String id; // Order number e.g., "ORD-9402X"
    
    private String customerName;
    private String orderDate;
    private Double totalAmount;
    private String status; // pending, shipped, delivered, cancelled
    private String paymentMethod; // Credit Card, PayPal, Bank Transfer, Apple Pay
}
