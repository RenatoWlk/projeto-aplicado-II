package com.projeto.aplicado.backend.model.users;

import com.projeto.aplicado.backend.model.ScheduledDonation;
import com.projeto.aplicado.backend.model.UserNotification;
import com.projeto.aplicado.backend.model.achievement.UnlockedAchievement;
import com.projeto.aplicado.backend.model.enums.BloodType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@TypeAlias("User")
@EqualsAndHashCode(callSuper = true)
@Data @NoArgsConstructor @AllArgsConstructor
public class User extends UserBase {
    private String cpf;
    private String gender;
    private BloodType bloodType;
    private int timesDonated;
    private LocalDate lastDonationDate;
    private int totalPoints;
    private List<UnlockedAchievement> unlockedAchievements = new ArrayList<>();
    private List<ScheduledDonation> scheduledDonations = new ArrayList<>();
    private List<String> redeemedRewardsIds = new ArrayList<>();
    private List<UserNotification> activeNotifications = new ArrayList<>();
}