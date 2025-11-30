package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserNotification {
    private String notificationBaseId;
    private boolean read;
    private Instant createdAt;
    private Instant expireAt;
}