package com.hrmanagement.notification.repository;

import com.hrmanagement.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    @Query("SELECT n FROM Notification n WHERE n.userId.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId.id = :userId AND n.isRead = false")
    long countByUserIdAndIsReadFalse(@Param("userId") String userId);
}
