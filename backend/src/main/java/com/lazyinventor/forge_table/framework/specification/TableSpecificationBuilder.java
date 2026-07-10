package com.lazyinventor.forge_table.framework.specification;

import com.lazyinventor.forge_table.framework.dto.TableFetchRequest;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class TableSpecificationBuilder {

    public static <T> Specification<T> buildSpecification(TableFetchRequest request) {
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Dynamic Filters Parsing
            if (request.getFilters() != null) {
                for (TableFetchRequest.Filter filter : request.getFilters()) {
                    String key = filter.getKey();
                    Object value = filter.getValue();

                    if (key == null) {
                        continue;
                    }

                    String operator = filter.getOperator();
                    if (operator == null) {
                        if (value instanceof Collection) {
                            operator = "IN";
                        } else {
                            operator = "EQUAL";
                        }
                    }
                    operator = operator.toUpperCase();

                    // Check if attribute exists on Root to avoid metamodel errors
                    try {
                        Class<?> attrType = root.getModel().getAttribute(key).getJavaType();

                        switch (operator) {
                            case "IS_NULL":
                                predicates.add(cb.isNull(root.get(key)));
                                break;
                            case "IS_NOT_NULL":
                                predicates.add(cb.isNotNull(root.get(key)));
                                break;
                            case "EQUAL":
                                if (value != null) {
                                    predicates.add(cb.equal(root.get(key), convertToType(value, attrType)));
                                }
                                break;
                            case "NOT_EQUAL":
                                if (value != null) {
                                    predicates.add(cb.notEqual(root.get(key), convertToType(value, attrType)));
                                }
                                break;
                            case "GREATER_THAN":
                                if (value != null && Comparable.class.isAssignableFrom(attrType)) {
                                    predicates.add(cb.greaterThan(root.get(key), (Comparable) convertToType(value, attrType)));
                                }
                                break;
                            case "GREATER_THAN_OR_EQUAL":
                                if (value != null && Comparable.class.isAssignableFrom(attrType)) {
                                    predicates.add(cb.greaterThanOrEqualTo(root.get(key), (Comparable) convertToType(value, attrType)));
                                }
                                break;
                            case "LESS_THAN":
                                if (value != null && Comparable.class.isAssignableFrom(attrType)) {
                                    predicates.add(cb.lessThan(root.get(key), (Comparable) convertToType(value, attrType)));
                                }
                                break;
                            case "LESS_THAN_OR_EQUAL":
                                if (value != null && Comparable.class.isAssignableFrom(attrType)) {
                                    predicates.add(cb.lessThanOrEqualTo(root.get(key), (Comparable) convertToType(value, attrType)));
                                }
                                break;
                            case "BETWEEN":
                                if (value instanceof Collection && Comparable.class.isAssignableFrom(attrType)) {
                                    List<?> list = new ArrayList<>((Collection<?>) value);
                                    if (list.size() >= 2 && list.get(0) != null && list.get(1) != null) {
                                        Comparable low = (Comparable) convertToType(list.get(0), attrType);
                                        Comparable high = (Comparable) convertToType(list.get(1), attrType);
                                        predicates.add(cb.between(root.get(key), low, high));
                                    }
                                }
                                break;
                            case "IN":
                                if (value instanceof Collection) {
                                    Collection<?> listVal = (Collection<?>) value;
                                    if (!listVal.isEmpty()) {
                                        if (attrType == String.class && (key.toLowerCase().contains("skill") || key.toLowerCase().contains("tag"))) {
                                            List<Predicate> orPredicates = new ArrayList<>();
                                            for (Object item : listVal) {
                                                String converted = (String) convertToType(item, attrType);
                                                orPredicates.add(cb.like(cb.lower(root.get(key)), "%" + converted.toLowerCase() + "%"));
                                            }
                                            predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                                        } else {
                                            List<Object> convertedList = new ArrayList<>();
                                            for (Object item : listVal) {
                                                convertedList.add(convertToType(item, attrType));
                                            }
                                            predicates.add(root.get(key).in(convertedList));
                                        }
                                    }
                                }
                                break;
                            case "LIKE":
                                if (value != null) {
                                    predicates.add(cb.like(cb.lower(root.get(key)), "%" + value.toString().toLowerCase() + "%"));
                                }
                                break;
                            default:
                                if (value != null) {
                                    predicates.add(cb.equal(root.get(key), convertToType(value, attrType)));
                                }
                                break;
                        }
                    } catch (IllegalArgumentException e) {
                        // Skip filters that do not map to properties of the entity
                    }
                }
            }

            // 2. Global Search Query
            if (request.getSearchQuery() != null && !request.getSearchQuery().trim().isEmpty()) {
                String searchPattern = "%" + request.getSearchQuery().trim().toLowerCase() + "%";
                List<Predicate> searchPredicates = new ArrayList<>();
                
                // Get all String attributes and apply LIKE query
                root.getModel().getAttributes().forEach(attr -> {
                    if (attr.getJavaType() == String.class) {
                        searchPredicates.add(cb.like(cb.lower(root.get(attr.getName())), searchPattern));
                    }
                });
                
                if (!searchPredicates.isEmpty()) {
                    predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
                }
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @SuppressWarnings("unchecked")
    private static Object convertToType(Object value, Class<?> targetType) {
        if (value == null) {
            return null;
        }
        if (targetType.isInstance(value)) {
            return value;
        }
        String strVal = value.toString().trim();
        if (targetType == String.class) {
            return strVal;
        }
        
        // Safe casting/handling for numbers to avoid Hibernate/Jackson type-mismatch exceptions
        try {
            if (targetType == java.time.LocalDate.class) {
                return java.time.LocalDate.parse(strVal);
            }
            if (targetType == java.time.LocalDateTime.class) {
                return java.time.LocalDateTime.parse(strVal);
            }
            if (targetType == Integer.class || targetType == int.class) {
                return Double.valueOf(strVal).intValue();
            }
            if (targetType == Long.class || targetType == long.class) {
                return Double.valueOf(strVal).longValue();
            }
            if (targetType == Double.class || targetType == double.class) {
                return Double.valueOf(strVal);
            }
            if (targetType == Float.class || targetType == float.class) {
                return Float.valueOf(strVal);
            }
            if (targetType == Boolean.class || targetType == boolean.class) {
                return Boolean.valueOf(strVal);
            }
            if (targetType.isEnum()) {
                return Enum.valueOf((Class<Enum>) targetType, strVal);
            }
        } catch (Exception e) {
            // Log fallback or handle
        }
        
        return value;
    }
}
