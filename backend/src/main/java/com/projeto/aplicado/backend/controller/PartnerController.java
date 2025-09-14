package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.partner.PartnerRequestDTO;
import com.projeto.aplicado.backend.dto.partner.PartnerResponseDTO;
import com.projeto.aplicado.backend.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
public class PartnerController {
    private final PartnerService partnerService;

    /**
     * Creates a new partner.
     * 
     * @param dto the partner request DTO
     * @return the created partner response DTO
     */
    @PostMapping("/create")
    public ResponseEntity<PartnerResponseDTO> create(@RequestBody PartnerRequestDTO dto) {
        return ResponseEntity.ok(partnerService.create(dto));
    }

    /**
     * Gets all partners.
     * 
     * @return a list of partner response DTOs
     */
    @GetMapping
    public ResponseEntity<List<PartnerResponseDTO>> getAll() {
        return ResponseEntity.ok(partnerService.findAll());
    }

    /**
     * Get an existing partner.
     * 
     * @param id the ID of the partner to get
     * @return the partner response DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<PartnerResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(partnerService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartnerResponseDTO> updatePartner(
            @PathVariable String id,
            @RequestBody PartnerRequestDTO dto) {
        return ResponseEntity.ok(partnerService.update(id, dto));
    }
}
