package com.projeto.aplicado.backend.dto.user;

import com.projeto.aplicado.backend.model.Address;
import lombok.Data;

@Data
public class UserLocationDTO {
    private String name;
    private Address address;
    private String phone;
    private Double latitude;
    private Double longitude;
}
