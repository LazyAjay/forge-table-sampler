package com.lazyinventor.forge_table.product.entity;

import com.lazyinventor.forge_table.framework.security.Maskable;
import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Data
@Entity
public class Employee implements Maskable {

    @Id
    private String id;
    
    private String name;
    private String project;
    private String location;
    private String checkInTime;
    private String checkOutTime;
    private String hours;
    private Boolean reportSubmitted;
    private String report;
    
    // PII fields to demonstrate dynamic data masking
    private String ssn;
    private Double salary;

    @Override
    public void mask(String userRole) {
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            if (this.ssn != null) {
                this.ssn = "***-**-****";
            }
            this.salary = null; // Standard users cannot see the salary data
        }
    }
}
