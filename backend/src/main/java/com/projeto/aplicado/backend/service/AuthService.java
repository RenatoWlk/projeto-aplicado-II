package com.projeto.aplicado.backend.service;

import com.projeto.aplicado.backend.constants.Messages;
import com.projeto.aplicado.backend.dto.auth.AuthRequest;
import com.projeto.aplicado.backend.dto.auth.AuthResponse;
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
     * @param request The authentication request containing the user's email and password.
     * @return An AuthResponse containing the generated JWT token.
     */
    public AuthResponse authenticate(AuthRequest request) {
        try {
            UserBase user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        System.err.println("User not found with email: " + request.getEmail());
                        return new UsernameNotFoundException(Messages.USER_NOT_FOUND);
                    });

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                System.err.println("Invalid password for email: " + request.getEmail());
                throw new BadCredentialsException(Messages.INVALID_CREDENTIALS);
            }

            String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getEmail(), user.getRole());

            return new AuthResponse(token);
        } catch (UsernameNotFoundException | BadCredentialsException ex) {
            System.err.println("Authentication failed: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error during authentication" + ex);
            throw new RuntimeException("Erro interno ao autenticar. Tente novamente mais tarde.");
        }
    }
}
