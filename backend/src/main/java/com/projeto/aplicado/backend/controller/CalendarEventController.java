package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.model.CalendarEvent;
import com.projeto.aplicado.backend.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class CalendarEventController {
    private CalendarEventService service;

    public CalendarEventController(CalendarEventService service) {
        this.service = service;
    }

    @PostMapping("/event")
    public CalendarEvent createEvent(@RequestBody CalendarEvent event) {
        return service.save(event);
    }

    @GetMapping("/event")
    public List<CalendarEvent> getEventsByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.getEventsByDate(date);
    }

    @PutMapping
    public CalendarEvent updateEvent(@RequestBody CalendarEvent event) {
        return service.update(event);
    }

    @DeleteMapping
    public void deleteEvent(@PathVariable Long id) {
        service.delete(id);
    }
}