package com.hrmanagement.notification.service;

import com.hrmanagement.auth.entity.User;
import com.hrmanagement.auth.repository.UserRepository;
import com.hrmanagement.common.exception.NotFoundException;
import com.hrmanagement.notification.entity.Notification;
import com.hrmanagement.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;

    private NotificationService notificationService;
    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, userRepository);
        user = User.builder().id("user-1").email("a@b.com").build();
        notification = Notification.builder()
                .id("notif-1").user(user)
                .title("Test").message("Test message")
                .type("leave_approved").relatedId("leave-1").relatedModel("Leave")
                .isRead(false)
                .build();
    }

    @Test
    void findByUser_returnsNotifications() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-1"))
                .thenReturn(List.of(notification));

        var result = notificationService.findByUser("user-1");

        assertEquals(1, result.size());
        assertEquals("Test", result.getFirst().getTitle());
    }

    @Test
    void unreadCount_returnsCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse("user-1")).thenReturn(3L);

        long count = notificationService.unreadCount("user-1");

        assertEquals(3, count);
    }

    @Test
    void markRead_updatesNotification() {
        when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = notificationService.markRead("notif-1", "user-1");

        assertTrue(result.getIsRead());
    }

    @Test
    void markRead_throwsIfNotOwnedByUser() {
        when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(notification));

        assertThrows(NotFoundException.class,
                () -> notificationService.markRead("notif-1", "other-user"));
    }

    @Test
    void markAllRead_marksAllUnread() {
        Notification n2 = Notification.builder().id("notif-2").user(user).isRead(false).build();
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-1"))
                .thenReturn(List.of(notification, n2));
        when(notificationRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        notificationService.markAllRead("user-1");

        assertTrue(notification.getIsRead());
        assertTrue(n2.getIsRead());
    }

    @Test
    void create_savesNotification() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(notificationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        notificationService.create("user-1", "Title", "Message", "system", "rel-1", "Leave");

        verify(notificationRepository).save(any(Notification.class));
    }
}
