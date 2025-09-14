package com.projeto.aplicado.backend.model.users;

import com.projeto.aplicado.backend.model.Address;
import com.projeto.aplicado.backend.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public abstract class UserBase {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private Address address;
    private String phone;
    private Role role; // "USER", "PARTNER" and "BLOODBANK"
}
