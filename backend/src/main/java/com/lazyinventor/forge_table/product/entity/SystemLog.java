package com.lazyinventor.forge_table.product.entity;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Data
@Entity
public class SystemLog {

    @Id
    private String id; // Log ID e.g., "LOG-10492"
    
    private String timestamp;
    private String level; // INFO, WARN, ERROR, DEBUG
    private String serviceName;
    private String message;
    private Long durationMs;
}
