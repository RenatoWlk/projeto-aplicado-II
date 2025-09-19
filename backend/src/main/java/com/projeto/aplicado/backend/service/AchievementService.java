package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.user.UserStatsDTO;
import com.projeto.aplicado.backend.model.achievement.Achievement;
import com.projeto.aplicado.backend.model.achievement.UnlockedAchievement;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.AchievementRepository;
import com.projeto.aplicado.backend.repository.EligibilityQuestionnaireRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AchievementService {
    private final AchievementRepository achievementRepository;
    private final EligibilityQuestionnaireRepository questionnaireRepository;
    private final UserRepository userRepository;

    /**
     * Validates and unlocks achievements for a user based on their stats.
     * 
     * @param user The user for whom to validate and unlock achievements.
     */
    public void validateAndUnlockAchievements(User user) {
        // TODO use this function to unlock achievements when schedule donations and confirm donation
        List<Achievement> allAchievements = achievementRepository.findAll();

        for (Achievement achievement : allAchievements) {
            List<UnlockedAchievement> unlockedAchievements = user.getUnlockedAchievements();
            boolean alreadyUnlocked = unlockedAchievements.stream()
                    .anyMatch(ua -> ua.getAchievementId().equals(achievement.getId()));

            if (!alreadyUnlocked && matchesCondition(user, achievement)) {
                UnlockedAchievement unlocked = new UnlockedAchievement();
                unlocked.setAchievementId(achievement.getId());
                unlocked.setUnlockedAt(LocalDateTime.now());

                user.getUnlockedAchievements().add(unlocked);
                user.setTotalPoints(user.getTotalPoints() + achievement.getPoints());
            }
        }

        userRepository.save(user); // Save updated achievements and points
    }

    /**
     * Checks if a user meets the conditions for an achievement.
     * 
     * @param user The user to check.
     * @param achievement The achievement to check against.
     * @return true if the user meets the conditions, false otherwise.
     * @throws RuntimeException in case the operation fails or an error occurs matching the condition.
     */
    private boolean matchesCondition(User user, Achievement achievement) throws RuntimeException {
        try {
            switch (achievement.getCondition().getType()) {
                case "times_donated":
                    return user.getTimesDonated() >= Integer.parseInt(achievement.getCondition().getValue());
                case "times_scheduled":
                    return user.getScheduledDonations().size() >= Integer.parseInt(achievement.getCondition().getValue());
                case "times_donated_in_year":
                    int currentYear = LocalDate.now().getYear();
                    long donationsThisYear = user.getDonations().stream()
                            .filter(d -> d.getDate().getYear() == currentYear)
                            .count();
                    return donationsThisYear >= Integer.parseInt(achievement.getCondition().getValue());
                case "questionnaire_answered":
                    return questionnaireRepository.findByUserId(user.getId()) != null;
                case "scheduled_in_first_week", "donated_4_times_per_year_by_5_years":
                    return true; // TODO finish conditions for achievements
                default:
                    return false;
            }
        } catch (Exception e) {
            throw new RuntimeException("Error trying to match condition: " + achievement.getCondition().getValue() + " of type: " + achievement.getCondition().getType() + "\n" + e.getMessage());
        }
    }

    /**
     * Unlocks a specific achievement by its type.
     *
     * @param user The user for whom to validate and unlock the achievement.
     * @param achievementType The achievement type e.g. "map_opened"
     */
    public void unlockAchievementByType(User user, String achievementType) {
        List<Achievement> allAchievements = achievementRepository.findAll();
        List<Achievement> actionAchievements = allAchievements.stream()
                .filter(a -> a.getCondition().getType().equals(achievementType))
                .toList();

        for (Achievement achievement : actionAchievements) {
            boolean alreadyUnlocked = user.getUnlockedAchievements().stream()
                    .anyMatch(ua -> ua.getAchievementId().equals(achievement.getId()));
            if (!alreadyUnlocked) {
                UnlockedAchievement unlocked = new UnlockedAchievement();
                unlocked.setAchievementId(achievement.getId());
                unlocked.setUnlockedAt(LocalDateTime.now());
                user.getUnlockedAchievements().add(unlocked);
                user.setTotalPoints(user.getTotalPoints() + achievement.getPoints());
            }
        }

        userRepository.save(user);
    }


    /**
     * Retrieves the achievements of a user.
     * 
     * @param user The user whose achievements to retrieve.
     * @return A list of achievements unlocked by the user.
     */
    public List<Achievement> getAchievementsFromUser(User user) {
        List<String> unlockedIds = user.getUnlockedAchievements().stream()
                .map(UnlockedAchievement::getAchievementId)
                .toList();

        return achievementRepository.findAllById(unlockedIds);
    }
}
