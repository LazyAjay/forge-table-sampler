package com.lazyinventor.forge_table.product.repository;

import com.lazyinventor.forge_table.product.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String>, JpaSpecificationExecutor<Employee> {
}
