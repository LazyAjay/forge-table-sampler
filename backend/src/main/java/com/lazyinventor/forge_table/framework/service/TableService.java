package com.lazyinventor.forge_table.framework.service;

import com.lazyinventor.forge_table.framework.dto.TableFetchRequest;
import com.lazyinventor.forge_table.framework.dto.TableFetchResponse;
import com.lazyinventor.forge_table.framework.security.Maskable;
import com.lazyinventor.forge_table.framework.specification.TableSpecificationBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TableService {

    @Autowired
    private ApplicationContext context;

    private final Map<String, JpaSpecificationExecutor<?>> repoMap = new HashMap<>();

    @PostConstruct
    public void init() {
        // Find all beans that implement JpaSpecificationExecutor
        Map<String, JpaSpecificationExecutor> beans = context.getBeansOfType(JpaSpecificationExecutor.class);
        for (JpaSpecificationExecutor<?> repo : beans.values()) {
            Class<?> domainType = resolveDomainType(repo);
            if (domainType != null) {
                // Map by simple class name (case-insensitive)
                repoMap.put(domainType.getSimpleName().toLowerCase(), repo);
            }
        }
    }

    private Class<?> resolveDomainType(JpaSpecificationExecutor<?> repo) {
        for (Class<?> iface : repo.getClass().getInterfaces()) {
            if (Repository.class.isAssignableFrom(iface)) {
                for (Type genericInterface : iface.getGenericInterfaces()) {
                    if (genericInterface instanceof ParameterizedType) {
                        ParameterizedType pt = (ParameterizedType) genericInterface;
                        if (Repository.class.isAssignableFrom((Class<?>) pt.getRawType())) {
                            Type[] actualTypeArguments = pt.getActualTypeArguments();
                            if (actualTypeArguments.length > 0) {
                                return (Class<?>) actualTypeArguments[0];
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public TableFetchResponse<?> fetchTableData(TableFetchRequest request, String userRole) {
        String entityName = request.getTargetEntity();
        if (entityName == null || entityName.trim().isEmpty()) {
            throw new IllegalArgumentException("targetEntity parameter is required");
        }

        JpaSpecificationExecutor<?> repo = repoMap.get(entityName.trim().toLowerCase());
        if (repo == null) {
            throw new IllegalArgumentException("No database repository found for entity type: " + entityName);
        }

        // 1. Build Multi-Sort Chaining
        Sort sort = Sort.unsorted();
        if (request.getSortFields() != null && !request.getSortFields().isEmpty()) {
            List<Sort.Order> orders = new ArrayList<>();
            for (TableFetchRequest.SortField sf : request.getSortFields()) {
                if (sf.getSortBy() == null || sf.getSortBy().trim().isEmpty()) {
                    continue;
                }
                Sort.Direction direction = "DESC".equalsIgnoreCase(sf.getSortOrder()) ? Sort.Direction.DESC : Sort.Direction.ASC;
                orders.add(new Sort.Order(direction, sf.getSortBy().trim()));
            }
            if (!orders.isEmpty()) {
                sort = Sort.by(orders);
            }
        }

        // 2. Build Pageable Page Request (Next.js is 1-indexed for page)
        int pageNum = Math.max(0, request.getPage() - 1);
        int pageSize = request.getPageSize() > 0 ? request.getPageSize() : 10;
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        // 3. Build Dynamic JPA Specification
        Specification<?> spec = TableSpecificationBuilder.buildSpecification(request);

        // 4. Query Database
        Page<?> pageResult = ((JpaSpecificationExecutor<Object>) repo).findAll((Specification<Object>) spec, pageable);

        // 5. Apply Role-based Data Masking with Dynamic Proxy Safe checks
        List<Object> content = new ArrayList<>();
        for (Object item : pageResult.getContent()) {
            Object unwrapped = unproxy(item);
            if (unwrapped instanceof Maskable) {
                ((Maskable) unwrapped).mask(userRole);
            }
            content.add(unwrapped);
        }

        return TableFetchResponse.builder()
                .data(content)
                .totalCount(pageResult.getTotalElements())
                .page(request.getPage())
                .pageSize(pageSize)
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    /**
     * Safely unwraps Hibernate dynamic proxies and Spring AOP proxies
     */
    private Object unproxy(Object entity) {
        if (entity == null) {
            return null;
        }
        // Unwrap Spring AOP Proxy
        if (org.springframework.aop.support.AopUtils.isAopProxy(entity) && entity instanceof org.springframework.aop.framework.Advised) {
            try {
                entity = ((org.springframework.aop.framework.Advised) entity).getTargetSource().getTarget();
            } catch (Exception e) {
                // Ignore and proceed
            }
        }
        // Unwrap Hibernate Lazy Initializer Proxy
        if (entity instanceof org.hibernate.proxy.HibernateProxy) {
            entity = ((org.hibernate.proxy.HibernateProxy) entity).getHibernateLazyInitializer().getImplementation();
        }
        return entity;
    }
}
