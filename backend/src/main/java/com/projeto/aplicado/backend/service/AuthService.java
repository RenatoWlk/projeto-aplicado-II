package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.auth.AuthRequest;
import com.projeto.aplicado.backend.dto.auth.AuthResponse;
import com.projeto.aplicado.backend.exception.AuthenticationException;
import com.projeto.aplicado.backend.exception.UserNotFoundException;
import com.projeto.aplicado.backend.model.enums.Role;
import com.projeto.aplicado.backend.model.users.UserBase;
import com.projeto.aplicado.backend.repository.UserRepository;
import com.projeto.aplicado.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticates a user by validating their credentials and generating a JWT token.
     *
     * @param request The {@link AuthRequest} containing the user's email and password.
     * @return An {@link AuthResponse} containing the generated JWT token.
     * @throws UserNotFoundException In case the user was not found with the email provided.
     * @throws BadCredentialsException In case the password provided is wrong.
     * @throws AuthenticationException In case the operation fails.
     */
    public AuthResponse authenticate(AuthRequest request) throws UserNotFoundException, BadCredentialsException, AuthenticationException {
        try {
            UserBase user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new UserNotFoundException(Role.USER, "User not found with the email provided when authenticating"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new BadCredentialsException(Messages.INVALID_CREDENTIALS);
            }

            String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getEmail(), user.getRole());

            return new AuthResponse(token);
        } catch (Exception ex) {
            throw new AuthenticationException("Failed to authenticate user");
        }
    }
}
