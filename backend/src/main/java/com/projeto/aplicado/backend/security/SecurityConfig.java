package com.projeto.aplicado.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configures the security filter chain for the application.<br><br>
     * This method sets up the security filter chain with the following configurations:<br>
     * - Disables CSRF protection.<br>
     * - Sets the session management policy to stateless.<br>
     * - Configures authorization rules for HTTP requests:<br>
     * - Allows all requests to the "/api/auth/**" endpoint without authentication.<br>
     * - Requires authentication for all other requests.<br>
     * - Adds the JWT authentication filter before the UsernamePasswordAuthenticationFilter.
     * 
     * @param http the HttpSecurity object to configure
     * @return the configured SecurityFilterChain
     * @throws Exception if an error occurs during configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Creates a PasswordEncoder bean using BCryptPasswordEncoder.<br><br>
     * This method provides a PasswordEncoder bean that uses the BCrypt hashing algorithm
     * to encode passwords. It is used for securely hashing and verifying passwords.
     * 
     * @return a PasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Creates an AuthenticationManager bean.<br><br>
     * This method provides an AuthenticationManager bean that is used for authenticating users.<br>
     * It retrieves the AuthenticationManager from the provided AuthenticationConfiguration.
     * 
     * @return an AuthenticationManager instance
     * @throws Exception if an error occurs during configuration
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
