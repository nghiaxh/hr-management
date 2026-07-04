package com.hrmanagement.employeehistory.entity;

import com.hrmanagement.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "employee_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employeeId;

    @Column(nullable = false)
    private String type;

    @Column(name = "previous_value")
    private String previousValue;

    @Column(name = "new_value", nullable = false)
    private String newValue;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
