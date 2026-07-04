package com.hrmanagement.notification.controller;

import com.hrmanagement.common.util.SecurityUtil;
import com.hrmanagement.notification.dto.NotificationResponse;
import com.hrmanagement.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> findAll() {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(notificationService.findByUser(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(userId)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllRead() {
        String userId = SecurityUtil.getCurrentUserId();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable String id) {
        String userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(notificationService.markRead(id, userId));
    }
}
