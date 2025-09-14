package com.projeto.aplicado.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Map;
import java.util.HashMap;

@Getter
public enum BloodType {
    A_POSITIVE("A+"),
    A_NEGATIVE("A-"),
    B_POSITIVE("B+"),
    B_NEGATIVE("B-"),
    AB_POSITIVE("AB+"),
    AB_NEGATIVE("AB-"),
    O_POSITIVE("O+"),
    O_NEGATIVE("O-");

    private final String label;

    BloodType(String label) {
        this.label = label;
    }

    @JsonValue
    public String toJson() {
        return label;
    }

    private static final Map<String, BloodType> LABEL_MAP = new HashMap<>();
    static {
        for (BloodType type : values()) {
            LABEL_MAP.put(type.label, type);
        }
    }

    @JsonCreator
    public static BloodType fromJson(String value) {
        BloodType type = LABEL_MAP.get(value);
        if (type == null) {
            throw new IllegalArgumentException("Invalid blood type: " + value);
        }
        return type;
    }
}
