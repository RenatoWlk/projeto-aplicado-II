package com.projeto.aplicado.backend.exception;

import com.projeto.aplicado.backend.model.enums.Role;
import lombok.Getter;

@Getter
public class UserNotFoundException extends RuntimeException {
    private final Role role;

    public UserNotFoundException(Role role, String message) {
        super(role + " not found: " + message);
        this.role = role;
    }
}
