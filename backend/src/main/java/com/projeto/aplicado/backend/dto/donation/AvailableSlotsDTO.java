package com.projeto.aplicado.backend.dto.donation;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AvailableSlotsDTO {
    private String date;
    private List<SlotInfo> slots;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SlotInfo {
        private String time;
        private int totalSpots;
        private int bookedSpots;
        private int availableSpots;
    }
}
