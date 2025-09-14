package com.projeto.aplicado.backend.controller;

import com.projeto.aplicado.backend.dto.user.UserLocationDTO;
import com.projeto.aplicado.backend.dto.user.UserRequestDTO;
import com.projeto.aplicado.backend.dto.user.UserResponseDTO;
import com.projeto.aplicado.backend.dto.user.UserStatsDTO;
import com.projeto.aplicado.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    /**
     * Creates a new user.
     * 
     * @param dto the user request DTO
     * @return the created user response DTO
     */
    @PostMapping("/create")
    public ResponseEntity<UserResponseDTO> create(@RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(userService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String id,
            @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    /**
     * Gets all users.
     * 
     * @return a list of user response DTOs
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    /**
     * Get an existing user.
     * 
     * @param id the ID of the user to get
     * @return the user response DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * Gets the statistics of a user.
     * 
     * @param id the ID of the user to get statistics for
     * @return the user statistics DTO
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<UserStatsDTO> getStatsById(@PathVariable String id) {
        return ResponseEntity.ok(userService.findStatsById(id));
    }

    /**
     * Gets the location of a user.
     *
     * @param id the ID of the user to get the location
     * @return the user location DTO
     */
    @GetMapping("/{id}/location")
    public ResponseEntity<UserLocationDTO> getLocationById(@PathVariable String id) {
        return ResponseEntity.ok(userService.findLocationById(id));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        userService.sendPasswordRecoveryEmail(email);
        return ResponseEntity.ok().build();
    }
}

