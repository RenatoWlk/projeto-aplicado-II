package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.user.UserStatsDTO;
import com.projeto.aplicado.backend.model.achievement.Achievement;
import com.projeto.aplicado.backend.model.achievement.UnlockedAchievement;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.AchievementRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    /**
     * Validates and unlocks achievements for a user based on their stats.
     * 
     * @param user The user for whom to validate and unlock achievements.
     */
    public void validateAndUnlockAchievements(User user) {
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
     */
    private boolean matchesCondition(User user, Achievement achievement) {
        switch (achievement.getCondition().getType()) {
            case "times_donated":
                return user.getTimesDonated() >= Integer.parseInt(achievement.getCondition().getValue());
            case "used_questionnaire":
                //return user.getLastQuestionnaire() == achievement.getCondition().getValue();
            case "scheduled_a_donation":
                //return true;
            default:
                return false;
        }
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
