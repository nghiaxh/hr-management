package com.hrmanagement.department.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDepartmentRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String description;
    private String managerId;
}
