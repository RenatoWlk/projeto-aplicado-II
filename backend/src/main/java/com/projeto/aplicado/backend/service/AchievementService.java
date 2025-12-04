package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.AchievementsConditionsTypes;
import com.projeto.aplicado.backend.exception.AchievementException;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.achievement.Achievement;
import com.projeto.aplicado.backend.model.achievement.UnlockedAchievement;
import com.projeto.aplicado.backend.model.enums.AchievementsNotifications;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.repository.AchievementRepository;
import com.projeto.aplicado.backend.repository.EligibilityQuestionnaireRepository;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
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
    private final NotificationService notificationService;

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

        List<Achievement> allAchievements = achievementRepository.findAll();

        for (Achievement achievement : allAchievements) {
            List<UnlockedAchievement> unlockedAchievements = user.getUnlockedAchievements();
            boolean alreadyUnlocked = unlockedAchievements.stream()
                    .anyMatch(ua -> ua.getAchievementId().equals(achievement.getId()));
            Pair<Boolean, AchievementsNotifications> match = matchesCondition(user, achievement);
            boolean matchesCondition = match.getFirst();
            AchievementsNotifications notification = match.getSecond();

            if (!alreadyUnlocked && matchesCondition) {
                UnlockedAchievement unlocked = new UnlockedAchievement();
                unlocked.setAchievementId(achievement.getId());
                unlocked.setUnlockedAt(LocalDateTime.now());

                user.getUnlockedAchievements().add(unlocked);
                user.setTotalPoints(user.getTotalPoints() + achievement.getPoints());
                notificationService.activateForUser(user.getId(), notification.getId(), 72);
            }
        }

        userRepository.save(user);
    }

    /**
     * Checks if a user meets the conditions for an achievement.
     * 
     * @param user The user to check.
     * @param achievement The achievement to check against.
     * @return checks if the user meets the conditions, and the notification of the achievement.
     * @throws AchievementException in case the operation fails or an error occurs matching the condition.
     */
    private Pair<Boolean, AchievementsNotifications> matchesCondition(User user, Achievement achievement) throws AchievementException {
        try {
            String type = achievement.getCondition().getType();
            String value = achievement.getCondition().getValue();

            switch (type) {

                case AchievementsConditionsTypes.TIMES_DONATED:
                    int required = Integer.parseInt(value);
                    boolean ok = user.getTimesDonated() >= required;

                    if (!ok) return Pair.of(false, AchievementsNotifications.NONE);

                    return switch (required) {
                        case 1 -> Pair.of(true, AchievementsNotifications.FIRST_DONATION);
                        case 5 -> Pair.of(true, AchievementsNotifications.FIVE_DONATIONS);
                        case 10 -> Pair.of(true, AchievementsNotifications.TEN_DONATIONS);
                        case 25 -> Pair.of(true, AchievementsNotifications.TWENTY_FIVE_DONATIONS);
                        case 50 -> Pair.of(true, AchievementsNotifications.FIFTY_DONATIONS);
                        default -> Pair.of(true, AchievementsNotifications.NONE);
                    };

                case AchievementsConditionsTypes.TIMES_SCHEDULED:
                    int count = user.getScheduledDonations().size();
                    int limit = Integer.parseInt(value);
                    boolean scheduledOk = count >= limit;

                    if (!scheduledOk) return Pair.of(false, AchievementsNotifications.NONE);

                    return switch (limit) {
                        case 1 -> Pair.of(true, AchievementsNotifications.FIRST_APPOINTMENT);
                        case 10 -> Pair.of(true, AchievementsNotifications.TEN_APPOINTMENTS);
                        case 30 -> Pair.of(true, AchievementsNotifications.THIRTY_APPOINTMENTS);
                        default -> Pair.of(true, AchievementsNotifications.NONE);
                    };

                case AchievementsConditionsTypes.TIMES_DONATED_IN_YEAR:
                    int currentYear = LocalDate.now().getYear();
                    long donations = user.getDonations().stream()
                            .filter(d -> d.getDate().getYear() == currentYear)
                            .count();
                    int needed = Integer.parseInt(value);

                    boolean yearOk = donations >= needed;
                    if (!yearOk) return Pair.of(false, AchievementsNotifications.NONE);

                    return switch (needed) {
                        case 2 -> Pair.of(true, AchievementsNotifications.TWO_DONATIONS_IN_YEAR);
                        case 3 -> Pair.of(true, AchievementsNotifications.THREE_DONATIONS_IN_YEAR);
                        case 4 -> Pair.of(true, AchievementsNotifications.FOUR_DONATIONS_IN_YEAR);
                        case 5 -> Pair.of(true, AchievementsNotifications.FIVE_DONATIONS_IN_YEAR);
                        default -> Pair.of(true, AchievementsNotifications.NONE);
                    };

                case AchievementsConditionsTypes.QUESTIONNAIRE_ANSWERED:
                    boolean answered = questionnaireRepository.findByUserId(user.getId()) != null;
                    return Pair.of(answered, answered ? AchievementsNotifications.FIRST_QUESTIONNAIRE : AchievementsNotifications.NONE);

                case AchievementsConditionsTypes.SCHEDULED_IN_FIRST_WEEK:
                    boolean week = user.getRegistrationDate().plusDays(7).isAfter(LocalDate.now());
                    return Pair.of(week, week ? AchievementsNotifications.FIRST_WEEK_DONATION : AchievementsNotifications.NONE);

                case AchievementsConditionsTypes.DONATED_4_TIMES_PER_YEAR_BY_5_YEARS:
                    boolean streak = hasFiveYearStreak(user);
                    return Pair.of(streak, streak ? AchievementsNotifications.DONATED_FIVE_YEARS_STREAK : AchievementsNotifications.NONE);

                default:
                    return Pair.of(false, AchievementsNotifications.NONE);
            }

        } catch (Exception e) {
            throw new AchievementException(
                    "Error matching condition: " + achievement.getCondition().getValue() +
                            " of type: " + achievement.getCondition().getType()
            );
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

    private boolean hasFiveYearStreak(User user) {
        int currentYear = LocalDate.now().getYear();

        for (int i = 0; i < 5; i++) {
            int year = currentYear - i;

            long donations = user.getDonations().stream()
                    .filter(d -> d.getDate().getYear() == year)
                    .count();

            if (donations < 4) return false;
        }
        return true;
    }
}
