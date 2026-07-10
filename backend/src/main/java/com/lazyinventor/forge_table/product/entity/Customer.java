package com.lazyinventor.forge_table.product.entity;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Data
@Entity
public class Customer {

    @Id
    private String id; // Customer ID e.g., "CUST-982"
    
    private String companyName;
    private String email;
    private String phone;
    private String country;
    private Integer rating; // 1-5 star rating
    private Double creditLimit;
    private String status; // active, inactive
}
