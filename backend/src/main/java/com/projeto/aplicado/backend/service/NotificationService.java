package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.dto.notification.ActivateAllRequestDTO;
import com.projeto.aplicado.backend.dto.notification.ActivateRequestDTO;
import com.projeto.aplicado.backend.dto.notification.NotificationDTO;
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
    public void activateForUser(ActivateRequestDTO dto) {
        String userId = dto.getUserId();
        String baseId = dto.getBaseId();
        int hoursToExpire = dto.getHoursToExpire();

        User user = userRepository.findById(userId).orElseThrow();
        if (user.getActiveNotifications() == null) {
            user.setActiveNotifications(new ArrayList<>());
        }

        Instant now = Instant.now();
        // Avoid duplicates
        boolean alreadyActive = user.getActiveNotifications().stream()
                .anyMatch(n -> n.getNotificationBaseId().equals(baseId) && n.getExpireAt().isAfter(now));
        if (alreadyActive) {
            return;
        }

        UserNotification un = new UserNotification(baseId, false, now, now.plus(hoursToExpire, ChronoUnit.HOURS));

        user.getActiveNotifications().add(un);
        userRepository.save(user);
    }

    // Activate notification for all users
    public void activateForAllUsers(ActivateAllRequestDTO dto) {
        List<User> users = userRepository.findAllUsers();
        Instant now = Instant.now();
        Instant expireAt = now.plus(dto.getHoursToExpire(), ChronoUnit.HOURS);

        for (User user : users) {
            if (user.getActiveNotifications() == null) {
                user.setActiveNotifications(new ArrayList<>());
            }

            boolean alreadyActive = user.getActiveNotifications().stream().anyMatch(n ->
                            n.getNotificationBaseId().equals(dto.getBaseId()) && n.getExpireAt().isAfter(now));
            if (!alreadyActive) {
                UserNotification notification = new UserNotification(dto.getBaseId(), false, now, expireAt);
                user.getActiveNotifications().add(notification);
            }
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
