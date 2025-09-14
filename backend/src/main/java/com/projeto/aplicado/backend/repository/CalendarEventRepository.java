package com.projeto.aplicado.backend.repository;

import com.projeto.aplicado.backend.model.CalendarEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalendarEventRepository extends MongoRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByDate(LocalDate date);
}