package com.hrmanagement.payroll.entity;

import com.hrmanagement.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payrolls", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "month", "year"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employeeId;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "basic_salary", nullable = false)
    private BigDecimal basicSalary;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal bonus = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "net_pay", nullable = false)
    private BigDecimal netPay;

    @Column(nullable = false)
    @Builder.Default
    private String status = "draft";

    @Column(name = "paid_at")
    private Instant paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
