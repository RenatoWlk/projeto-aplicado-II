package com.projeto.aplicado.backend.dto.notification;

import lombok.Data;

@Data
public class ActivateRequestDTO {
    public String userId;
    public String baseId;
    public int hoursToExpire = 24;
}
