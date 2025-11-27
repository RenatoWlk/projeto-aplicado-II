package com.projeto.aplicado.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reward {
    private String id;
    private String title;
    private String partnerId;
    private String description;
    private int requiredPoints;
    private int stock;
}