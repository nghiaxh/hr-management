package com.hrmanagement.leavebalance.entity;

import com.hrmanagement.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "leave_balances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(name = "annual_total")
    @Builder.Default
    private Integer annualTotal = 12;

    @Column(name = "annual_used")
    @Builder.Default
    private Integer annualUsed = 0;

    @Column(name = "sick_total")
    @Builder.Default
    private Integer sickTotal = 30;

    @Column(name = "sick_used")
    @Builder.Default
    private Integer sickUsed = 0;

    @Column(name = "personal_total")
    @Builder.Default
    private Integer personalTotal = 3;

    @Column(name = "personal_used")
    @Builder.Default
    private Integer personalUsed = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
