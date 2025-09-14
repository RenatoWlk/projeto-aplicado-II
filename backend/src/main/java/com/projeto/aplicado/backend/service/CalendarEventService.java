package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.model.CalendarEvent;
import com.projeto.aplicado.backend.repository.CalendarEventRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor @NoArgsConstructor
public class CalendarEventService {
    private CalendarEventRepository calendarEventRepository;

    public CalendarEvent save(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }

    public List<CalendarEvent> getEventsByDate(LocalDate date) {
        return calendarEventRepository.findByDate(date);
    }

    public void delete(Long id) {
        calendarEventRepository.deleteById(id);
    }

    public CalendarEvent update(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }
}