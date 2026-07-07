package com.hrmanagement.employee.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {
    @JsonProperty("userId")
    @NotNull(message = "User ID is required")
    private String userId;

    @JsonProperty("departmentId")
    @NotBlank(message = "Department is required")
    private String departmentId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Position is required")
    private String position;

    @NotNull(message = "Salary is required")
    @PositiveOrZero(message = "Salary must be >= 0")
    private BigDecimal salary;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    private String phone;
    private String contractType;
    private LocalDate contractExpiry;
}
