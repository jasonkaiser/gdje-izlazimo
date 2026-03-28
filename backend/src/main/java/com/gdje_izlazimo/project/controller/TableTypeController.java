package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.TableTypeResponse;
import com.gdje_izlazimo.project.service.TableTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Table Types", description = "Table type management endpoints")
public class TableTypeController {

    private final TableTypeService tableTypeService;

    @Autowired
    public TableTypeController(TableTypeService tableTypeService) {
        this.tableTypeService = tableTypeService;
    }

    @Operation(summary = "Get all table types", description = "Returns a list of all available table types. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Table types retrieved successfully")
    })
    @PermitAll
    @GetMapping
    public ResponseEntity<List<TableTypeResponse>> findAllTableTypes() {
        return ResponseEntity.ok(tableTypeService.findAllTableTypes());
    }

    @Operation(summary = "Get table type by ID", description = "Returns a single table type by its UUID. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Table type found"),
            @ApiResponse(responseCode = "404", description = "Table type not found")
    })
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<TableTypeResponse> findTableTypeById(
            @Parameter(description = "Table type UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(tableTypeService.findTableTypeById(id));
    }

    @Operation(summary = "Create a table type", description = "Creates a new table type. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Table type created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('admin')")
    @PostMapping
    public ResponseEntity<TableTypeResponse> createTableType(@Valid @RequestBody CreateTableTypeRequest entity) {
        return ResponseEntity.ok(tableTypeService.createTableType(entity));
    }

    @Operation(summary = "Update a table type", description = "Updates an existing table type. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Table type updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Table type not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<TableTypeResponse> updateTableType(
            @Parameter(description = "Table type UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateTableTypeRequest request) {
        return ResponseEntity.ok(tableTypeService.updateTableType(request, id));
    }

    @Operation(summary = "Delete a table type", description = "Permanently deletes a table type. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Table type deleted"),
            @ApiResponse(responseCode = "404", description = "Table type not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTableType(
            @Parameter(description = "Table type UUID") @PathVariable UUID id) {
        tableTypeService.deleteTableType(id);
        return ResponseEntity.noContent().build();
    }
}