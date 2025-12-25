package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.TableTypeResponse;
import com.gdje_izlazimo.project.service.TableTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/table-types")
public class TableTypeController {

    private final TableTypeService tableTypeService;

    @Autowired
    public TableTypeController(TableTypeService tableTypeService) {
        this.tableTypeService = tableTypeService;
    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping
    public ResponseEntity<List<TableTypeResponse>> findAllTableTypes(){

        List<TableTypeResponse> responses = tableTypeService.findAllTableTypes();
        return ResponseEntity.ok(responses);

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<TableTypeResponse> findTableTypeById(@PathVariable UUID id){

        TableTypeResponse response = tableTypeService.findTableTypeById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<TableTypeResponse> createTableType(@Valid @RequestBody CreateTableTypeRequest entity){

        TableTypeResponse tableTypeResponse = tableTypeService.createTableType(entity);
        return ResponseEntity.ok(tableTypeResponse);

    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<TableTypeResponse> updateTableType(@PathVariable UUID id,
                                                             @Valid @RequestBody UpdateTableTypeRequest request){
        TableTypeResponse response = tableTypeService.updateTableType(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTableType(@PathVariable UUID id){

        tableTypeService.deleteTableType(id);
        return ResponseEntity.noContent().build();
    }
}