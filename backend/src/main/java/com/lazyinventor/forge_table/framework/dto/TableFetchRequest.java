package com.lazyinventor.forge_table.framework.dto;

import lombok.Data;
import java.util.List;

@Data
public class TableFetchRequest {
    private String targetEntity;
    private int page;
    private int pageSize;
    private List<Filter> filters;
    private List<SortField> sortFields;
    private String searchQuery; // Support search query field

    @Data
    public static class Filter {
        private String key;
        private String operator; // Dynamic operators (e.g. EQUAL, BETWEEN, GREATER_THAN)
        private Object value;
    }

    @Data
    public static class SortField {
        private String sortBy;
        private String sortOrder; // "ASC" or "DESC"
    }
}
