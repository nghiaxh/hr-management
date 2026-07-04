package com.hrmanagement.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    @JsonProperty("_id")
    private String id;
    private Object employeeId;
    private LocalDate date;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String status;
    private String note;
}
