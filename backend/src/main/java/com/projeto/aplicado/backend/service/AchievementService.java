package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.AchievementsConditionsTypes;
import com.projeto.aplicado.backend.exception.AchievementException;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.achievement.Achievement;
import com.projeto.aplicado.backend.model.achievement.UnlockedAchievement;
import com.projeto.aplicado.backend.model.enums.Role;
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
     * @throws UserNotFoundException In case the user is null or the user ID is null.
     */
    public void validateAndUnlockAchievements(User user) throws UserNotFoundException {
        if (user == null || user.getId() == null) {
            throw new UserNotFoundException(Role.USER, "User or User ID is null when validating achievements");
        }

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

        userRepository.save(user);
    }

    /**
     * Checks if a user meets the conditions for an achievement.
     * 
     * @param user The user to check.
     * @param achievement The achievement to check against.
     * @return true if the user meets the conditions, false otherwise.
     * @throws AchievementException in case the operation fails or an error occurs matching the condition.
     */
    private boolean matchesCondition(User user, Achievement achievement) throws AchievementException {
        try {
            switch (achievement.getCondition().getType()) {
                case AchievementsConditionsTypes.TIMES_DONATED:
                    return user.getTimesDonated() >= Integer.parseInt(achievement.getCondition().getValue());
                case AchievementsConditionsTypes.TIMES_SCHEDULED:
                    return user.getScheduledDonations().size() >= Integer.parseInt(achievement.getCondition().getValue());
                case AchievementsConditionsTypes.TIMES_DONATED_IN_YEAR:
                    int currentYear = LocalDate.now().getYear();
                    long donationsThisYear = user.getDonations().stream()
                            .filter(d -> d.getDate().getYear() == currentYear)
                            .count();
                    return donationsThisYear >= Integer.parseInt(achievement.getCondition().getValue());
                case AchievementsConditionsTypes.QUESTIONNAIRE_ANSWERED:
                    return questionnaireRepository.findByUserId(user.getId()) != null;
                case AchievementsConditionsTypes.SCHEDULED_IN_FIRST_WEEK, AchievementsConditionsTypes.DONATED_4_TIMES_PER_YEAR_BY_5_YEARS:
                    return true; // TODO finish conditions for achievements
                default:
                    return false;
            }
        } catch (Exception e) {
            throw new AchievementException("Error trying to match condition: " + achievement.getCondition().getValue() + " of type: " + achievement.getCondition().getType());
        }
    }

    /**
     * Unlocks a specific achievement by its type.
     *
     * @param user The user for whom to validate and unlock the achievement.
     * @param achievementType The achievement type e.g. "map_opened"
     * @throws AchievementException if the operation fails.
     */
    public void unlockAchievementByType(User user, String achievementType) throws AchievementException {
        List<Achievement> allAchievements = achievementRepository.findAll();
        List<Achievement> actionAchievements = allAchievements.stream()
                .filter(a -> a.getCondition().getType().equals(achievementType))
                .toList();

        try {
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
        } catch (Exception ex) {
            throw new AchievementException("Error unlocking the achievement " + achievementType);
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
