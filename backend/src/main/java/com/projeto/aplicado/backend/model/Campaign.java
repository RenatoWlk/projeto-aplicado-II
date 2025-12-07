package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class Campaign {
    @Id
    private String id;
    private String title;
    private String body;
    private LocalDate startDate;
    private LocalDate endDate;
    private Address location;
    private String phone;
}
