package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.EligibilityQuestionnaire;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EligibilityQuestionnaireRepository extends MongoRepository<EligibilityQuestionnaire, String> {
    List<EligibilityQuestionnaire> findByUserId(String userId);

    @Query("{ 'isEligible': true }")
    List<EligibilityQuestionnaire> findAllEligible();

    @Query("{ 'isEligible': false }")
    List<EligibilityQuestionnaire> findAllIneligible();
}
