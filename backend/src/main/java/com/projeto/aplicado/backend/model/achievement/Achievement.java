package com.projeto.aplicado.backend.model.achievement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document("achievements")
public class Achievement {
    private String id;
    private String title;
    private String description;
    private int points;

    /** "Comum", "Raro", "Épico", "Lendário" or "Mítico" */
    private String rarity;

    /**
     * Icon name. <br>
     * Better examples: "fa-star", "fa-heart", "fa-hand-holding-heart", "fa-award", "fa-trophy". <br>
     * See more at: <a href="https://fontawesome.com/search?o=r&s=solid&ip=classic">FontAwesome</a>
     */
    private String imageUrl;

    /** Type and Value (e.g., "times_donated" and 10) */
    private AchievementCondition condition;
}
