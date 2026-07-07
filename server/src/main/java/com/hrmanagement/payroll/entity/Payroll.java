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
    private Employee employee;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "basic_salary", nullable = false)
    private BigDecimal basicSalary;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal bonus = BigDecimal.ZERO;

    @Column(name = "social_insurance", nullable = false)
    @Builder.Default
    private BigDecimal socialInsurance = BigDecimal.ZERO;

    @Column(name = "health_insurance", nullable = false)
    @Builder.Default
    private BigDecimal healthInsurance = BigDecimal.ZERO;

    @Column(name = "unemployment_insurance", nullable = false)
    @Builder.Default
    private BigDecimal unemploymentInsurance = BigDecimal.ZERO;

    @Column(name = "union_dues", nullable = false)
    @Builder.Default
    private BigDecimal unionDues = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal pit = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

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
