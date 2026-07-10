package com.lazyinventor.forge_table.framework.controller;

import com.lazyinventor.forge_table.framework.dto.TableFetchRequest;
import com.lazyinventor.forge_table.framework.dto.TableFetchResponse;
import com.lazyinventor.forge_table.framework.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tables")
public class TableController {

    @Autowired
    private TableService tableService;

    @PostMapping("/fetch")
    public TableFetchResponse<?> fetchTableData(
            @RequestBody TableFetchRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "STANDARD_USER") String userRole) {
        return tableService.fetchTableData(request, userRole);
    }
}
