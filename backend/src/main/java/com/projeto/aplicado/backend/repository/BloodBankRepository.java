package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.users.BloodBank;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloodBankRepository extends MongoRepository<BloodBank, String> {
    @Query("{ '_id': ?0, 'role': 'BLOODBANK' }")
    Optional<BloodBank> findBloodBankById(String id);

    @Query("{ 'email': ?0, 'role': 'BLOODBANK' }")
    Optional<BloodBank> findByEmail(String email);

    @Query("{ 'role': 'BLOODBANK' }")
    List<BloodBank> findAllBloodBanks();

    @Query("{ 'availabilitySlots.0': { $exists: true } }")
    List<BloodBank> findByAvailabilitySlotsNotNull();

    @Aggregation(pipeline = {
            "{ '$match': { 'availabilitySlots.0': { '$exists': true } } }",
            "{ '$project': { 'availabilitySlots.startDate': 1, 'availabilitySlots.endDate': 1 } }"
    })
    List<BloodBank> findAvailableDatesOnly();

    @Aggregation(pipeline = {
            "{ '$match': { 'availabilitySlots.0': { '$exists': true } } }",
            "{ '$project': { 'availabilitySlots.startTime': 1, 'availabilitySlots.endTime': 1 } }"
    })
    List<BloodBank> findAvailableHoursOnly();

}
