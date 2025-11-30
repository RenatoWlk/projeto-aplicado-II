package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.controller.NotificationController;
import com.projeto.aplicado.backend.dto.NotificationDTO;
import com.projeto.aplicado.backend.model.NotificationBase;
import com.projeto.aplicado.backend.model.UserNotification;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.NotificationRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final UserRepository userRepository;
    private final NotificationRepository baseRepository;

    // Activate a notification for one user
    public void activateForUser(String userId, String baseId, int hoursToExpire) {
        User user = userRepository.findById(userId).orElseThrow();

        UserNotification un = new UserNotification(baseId, false, Instant.now(), Instant.now().plus(hoursToExpire, ChronoUnit.HOURS));

        if (user.getActiveNotifications() == null) {
            user.setActiveNotifications(new ArrayList<>());
        }
        user.getActiveNotifications().add(un);
        userRepository.save(user);
    }

    // Activate notification for all users
    public void activateForAllUsers(NotificationController.ActivateAllRequest dto) {
        List<User> users = userRepository.findAllUsers();
        Instant expireAt = Instant.now().plus(dto.getHoursToExpire(), ChronoUnit.HOURS);
        UserNotification newNotification = new UserNotification(dto.getBaseId(), false, Instant.now(), expireAt);

        for (User user : users) {
            if (user.getActiveNotifications() == null) {
                user.setActiveNotifications(new ArrayList<>());
            }
            user.getActiveNotifications().add(newNotification);
        }

        userRepository.saveAll(users);
    }

    public Integer getUnreadCount(String userId) {
        User user = userRepository.findById(userId).orElseThrow();

        return user.getActiveNotifications().stream().filter(not -> !not.isRead()).toList().size();
    }

    // Fetch notifications
    public List<NotificationDTO> getAllNotificationsForUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow();

        if (user.getActiveNotifications() == null) {
            user.setActiveNotifications(new ArrayList<>());
        }

        // Filter expired
        user.getActiveNotifications().removeIf(n -> n.getExpireAt().isBefore(Instant.now()));
        userRepository.save(user);

        return user.getActiveNotifications().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Mark as read
    public void markRead(String userId, String baseId) {
        User user = userRepository.findById(userId).orElseThrow();

        user.getActiveNotifications().stream()
                .filter(n -> n.getNotificationBaseId().equals(baseId))
                .forEach(n -> n.setRead(true));

        userRepository.save(user);
    }

    // Mark all read
    public void markAllRead(String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.getActiveNotifications().forEach(n -> n.setRead(true));
        userRepository.save(user);
    }

    // Mapper
    private NotificationDTO mapToDto(UserNotification n) {
        NotificationBase base = baseRepository.findById(n.getNotificationBaseId()).orElseThrow();

        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationBaseId(base.getId());
        dto.setTitle(base.getTitle());
        dto.setBody(base.getBody());
        dto.setType(base.getType());
        dto.setRedirectTo(base.getRedirectTo());
        dto.setMetadata(base.getMetadata());

        dto.setRead(n.isRead());
        dto.setExpireAt(n.getExpireAt());
        dto.setCreatedAt(n.getCreatedAt());

        return dto;
    }
}
