package com.projeto.aplicado.backend.security;

import com.projeto.aplicado.backend.model.enums.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    private static final long EXPIRATION_TIME = 86400000; // 1 day

    /**
     * Generate a JWT token for the given user ID.
     * 
     * @param userId the user ID to include in the token
     * @param userName the username to include in the token
     * @param email the user email to include in the token
     * @return the generated JWT token
     */
    public String generateToken(String userId, String userName, String email, Role role) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(userId)
                .claim("userName", userName)
                .claim("email", email)
                .claim("role", role.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract the user ID from the given JWT token.
     * 
     * @param token the JWT token to extract the user ID from
     * @return the extracted user ID
     */
    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extract the username from the given JWT token.
     *
     * @param token the JWT token to extract the username from
     * @return the extracted username
     */
    public String extractUserName(String token) {
        return getClaims(token).get("userName", String.class);
    }

    /**
     * Extract the user email from the given JWT token.
     *
     * @param token the JWT token to extract the user email from
     * @return the extracted user email
     */
    public String extractEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    /**
     * Extract the user role from the given JWT token.
     *
     * @param token the JWT token to extract the user role from
     * @return the extracted user role
     */
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * Validate the given JWT token.
     * 
     * @param token the JWT token to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extract the expiration date from the given JWT token.
     * 
     * @param token the JWT token to extract the expiration date from
     * @return the extracted expiration date
     */
    private Claims getClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
