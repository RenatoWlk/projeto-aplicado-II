package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.users.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("{ '_id': ?0, 'role': 'USER' }")
    Optional<User> findUserById(String id);

    @Query("{ 'email': ?0, 'role': 'USER' }")
    Optional<User> findUserByEmail(String email);

    @Query("{ 'role': 'USER' }")
    List<User> findAllUsers();
}
