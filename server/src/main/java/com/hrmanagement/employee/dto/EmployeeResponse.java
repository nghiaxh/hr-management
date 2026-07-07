package com.hrmanagement.employee.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    @JsonProperty("id")
    private String id;
    private Object userId;
    private Object departmentId;
    private String firstName;
    private String lastName;
    private String position;
    private BigDecimal salary;
    private LocalDate hireDate;
    private String phone;
    private String contractType;
    private LocalDate contractExpiry;
    @JsonProperty("createdAt")
    private Instant createdAt;
    @JsonProperty("updatedAt")
    private Instant updatedAt;
}
