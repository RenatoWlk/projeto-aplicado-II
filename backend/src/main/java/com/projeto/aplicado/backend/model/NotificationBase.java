package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationBase {
    @Id
    private String id;
    private String title;
    private String body;
    private String type; // ex: OFFERS, CAMPAIGNS, REWARDS, ACHIEVEMENT
    private String redirectTo; // ex: "/dashboard", "/rewards"
    private Map<String, Object> metadata; // ex: achievementId, rewardId
}
