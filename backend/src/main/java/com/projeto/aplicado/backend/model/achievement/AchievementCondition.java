package com.projeto.aplicado.backend.model.achievement;

import lombok.Data;

@Data
public class AchievementCondition {
    /** Type of the condition e.g. "times_donated", "times_scheduled", "questionnaire_answered" */
    private String type;

    /** The value of the condition e.g. "10", "5", "true"*/
    private String value;
}
