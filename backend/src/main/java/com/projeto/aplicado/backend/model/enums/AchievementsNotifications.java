package com.projeto.aplicado.backend.model.enums;

import lombok.Getter;

@Getter
public enum AchievementsNotifications {
    FIRST_DONATION("achievement_first_donation"),
    FIVE_DONATIONS("achievement_5_donations"),
    TEN_DONATIONS("achievement_10_donations"),
    TWENTY_FIVE_DONATIONS("achievement_25_donations"),
    FIFTY_DONATIONS("achievement_50_donations"),
    FIRST_APPOINTMENT("achievement_first_appointment"),
    TEN_APPOINTMENTS("achievement_10_appointments"),
    THIRTY_APPOINTMENTS("achievement_30_appointments"),
    TWO_DONATIONS_IN_YEAR("achievement_2_year_donations"),
    THREE_DONATIONS_IN_YEAR("achievement_3_year_donations"),
    FOUR_DONATIONS_IN_YEAR("achievement_4_year_donations"),
    FIVE_DONATIONS_IN_YEAR("achievement_5_year_donations"),
    FIRST_QUESTIONNAIRE("achievement_first_quiz"),
    OPENED_MAP_FIRST_TIME("achievement_opened_map"),
    SECRET_FOUND("achievement_secret_found"),
    FIRST_WEEK_DONATION("achievement_first_week_donation"),
    QUESTIONNAIRE_PERFECT("achievement_quiz_perfect"),
    DONATED_FIVE_YEARS_STREAK("achievement_5_years_streak"),
    NONE(null);

    private final String id;

    AchievementsNotifications(String id) {
        this.id = id;
    }
}
