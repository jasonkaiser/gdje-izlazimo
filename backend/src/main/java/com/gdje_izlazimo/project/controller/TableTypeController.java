package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.TableTypeResponse;
import com.gdje_izlazimo.project.service.TableTypeService;
import jakarta.annotation.security.PermitAll;
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

    @PermitAll
    @GetMapping
    public ResponseEntity<List<TableTypeResponse>> findAllTableTypes(){
        return ResponseEntity.ok(tableTypeService.findAllTableTypes());

    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<TableTypeResponse> findTableTypeById(@PathVariable UUID id){
        return ResponseEntity.ok(tableTypeService.findTableTypeById(id));

    }

    @PreAuthorize("hasAnyRole('admin')")
    @PostMapping
    public ResponseEntity<TableTypeResponse> createTableType(@Valid @RequestBody CreateTableTypeRequest entity){
        return ResponseEntity.ok(tableTypeService.createTableType(entity));

    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<TableTypeResponse> updateTableType(@PathVariable UUID id, @Valid @RequestBody UpdateTableTypeRequest request){
        return ResponseEntity.ok(tableTypeService.updateTableType(request, id));
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTableType(@PathVariable UUID id){
        tableTypeService.deleteTableType(id);
        return ResponseEntity.noContent().build();
    }
}