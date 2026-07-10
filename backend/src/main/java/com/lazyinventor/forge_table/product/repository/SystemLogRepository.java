package com.lazyinventor.forge_table.product.repository;

import com.lazyinventor.forge_table.product.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, String>, JpaSpecificationExecutor<SystemLog> {
}
