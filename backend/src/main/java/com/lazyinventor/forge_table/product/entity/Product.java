package com.lazyinventor.forge_table.product.entity;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Data
@Entity
public class Product {

    @Id
    private String id; // SKU or system ID e.g., "PROD-1029X"
    
    private String name;
    private String sku;
    private Double price;
    private Integer stock;
    private String category;
    private String status; // active, discontinued
    private Double weight;
}
