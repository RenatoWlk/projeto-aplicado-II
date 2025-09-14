package com.projeto.aplicado.backend.dto.user;

import com.projeto.aplicado.backend.model.enums.BloodType;
import com.projeto.aplicado.backend.model.enums.Role;

import java.time.LocalDate;

import com.projeto.aplicado.backend.model.Address;
import lombok.Data;

@Data
public class UserResponseDTO {
    private String id;
    private String name;
    private String email;
    private Address address;
    private String phone;
    private Role role;
    private String cpf;
    private String gender;
    private BloodType bloodType;
    private Integer timeUntilNextDonation;
    private LocalDate lastDonationDate;
    private String photoUrl;
}
