package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.NotificationBase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationBase, String> {

}
