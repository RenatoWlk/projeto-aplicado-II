package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.model.achievement.Achievement;
import com.projeto.aplicado.backend.model.users.User;
import com.projeto.aplicado.backend.service.AchievementService;
import com.projeto.aplicado.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementsController {
    private final AchievementService achievementService;
    private final UserRepository userRepository;

    /**
     * Get all achievements unlocked by a specific user.
     *
     * @param id the ID of the user.
     * @return a list of unlocked achievements.
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<List<Achievement>> getUserAchievements(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(achievementService.getAchievementsFromUser(user));
    }

    /**
     * Validate and unlock achievements for a user.
     * Useful after an action like donating, scheduling, etc.
     *
     * @param id the ID of the user.
     * @return the updated list of unlocked achievements.
     */
    @PostMapping("/validate/{id}")
    public ResponseEntity<List<Achievement>> validateAchievements(@PathVariable String id) {
        User user = userRepository.findById(id).orElseThrow();
        achievementService.validateAndUnlockAchievements(user);
        return ResponseEntity.ok(achievementService.getAchievementsFromUser(user));
    }
}
