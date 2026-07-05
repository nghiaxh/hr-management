package com.hrmanagement.notification.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.notification.dto.NotificationResponse;
import com.hrmanagement.notification.entity.Notification;
import com.hrmanagement.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<NotificationResponse> findByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    public long unreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markRead(String id, String userId) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notif.getUserId().getId().equals(userId)) {
            throw new NotFoundException("Notification not found");
        }
        notif.setIsRead(true);
        notificationRepository.save(notif);
        return toResponse(notif);
    }

    @Transactional
    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !Boolean.TRUE.equals(n.getIsRead())).toList();
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void create(String userId, String title, String message, String type,
                       String relatedId, String relatedModel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Notification notif = Notification.builder()
                .userId(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .relatedModel(relatedModel)
                .build();
        notificationRepository.save(notif);
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse resp = new NotificationResponse();
        resp.setId(n.getId());
        resp.setUserId(n.getUserId().getId());
        resp.setTitle(n.getTitle());
        resp.setMessage(n.getMessage());
        resp.setType(n.getType());
        resp.setRelatedId(n.getRelatedId());
        resp.setRelatedModel(n.getRelatedModel());
        resp.setIsRead(n.getIsRead());
        resp.setCreatedAt(n.getCreatedAt());
        return resp;
    }
}
