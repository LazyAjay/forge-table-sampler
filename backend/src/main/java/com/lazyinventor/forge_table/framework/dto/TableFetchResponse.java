package com.lazyinventor.forge_table.framework.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TableFetchResponse<T> {
    private List<T> data;
    private long totalCount;
    private int page;
    private int pageSize;
    private int totalPages;
}
