package com.projeto.aplicado.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String notificationBaseId;
    private String title;
    private String body;
    private String type;
    private String redirectTo;
    private Map<String, Object> metadata;
    private boolean read;
    private Instant expireAt;
    private Instant createdAt;
}
