package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.users.Partner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends MongoRepository<Partner, String> {
    @Query("{ '_id': ?0, 'role': 'PARTNER' }")
    Optional<Partner> findPartnerById(String id);

    @Query("{ 'email': ?0, 'role': 'PARTNER' }")
    Optional<Partner> findByEmail(String email);

    @Query("{ 'role': 'PARTNER' }")
    List<Partner> findAllPartners();
}

