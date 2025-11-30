package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.NotificationDTO;
import com.projeto.aplicado.backend.service.NotificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUnreadCount(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(service.getAllNotificationsForUser(userId));
    }

    @PostMapping("/activate-user")
    public ResponseEntity<Void> activateForUser(@RequestBody ActivateRequest req) {
        service.activateForUser(req.userId, req.baseId, req.hoursToExpire);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/activate-all")
    public ResponseEntity<Void> activateForAll(@RequestBody ActivateAllRequest req) {
        service.activateForAllUsers(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/mark-read/{baseId}")
    public ResponseEntity<Void> markRead(@PathVariable String userId, @PathVariable String baseId) {
        service.markRead(userId, baseId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/mark-all-read")
    public ResponseEntity<Void> markAll(@PathVariable String userId) {
        service.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ActivateRequest {
        public String userId;
        public String baseId;
        public int hoursToExpire = 24;
    }

    @Data
    public static class ActivateAllRequest {
        public String baseId;
        public int hoursToExpire = 24;
    }
}