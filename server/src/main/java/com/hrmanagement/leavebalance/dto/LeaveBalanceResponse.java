package com.hrmanagement.leavebalance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceResponse {
    @JsonProperty("id")
    private String id;
    private String employeeId;
    private Integer annualTotal;
    private Integer annualUsed;
    private Integer sickTotal;
    private Integer sickUsed;
    private Integer personalTotal;
    private Integer personalUsed;
}
