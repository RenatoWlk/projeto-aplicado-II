package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.achievement.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    // add more functions here if needed
}
