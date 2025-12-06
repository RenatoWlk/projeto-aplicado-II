package com.projeto.aplicado.backend.dto.notification;

import lombok.Data;

@Data
public class ActivateAllRequestDTO {
    public String baseId;
    public int hoursToExpire = 24;
}
