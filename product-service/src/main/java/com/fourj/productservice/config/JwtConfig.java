package com.fourj.productservice.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.util.Base64;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret:}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private Long expiration;

    private SecretKey secretKey;

    @Bean
    public SecretKey secretKey() {
        try {
            if (secret == null || secret.isEmpty()) {
                throw new IllegalArgumentException("JWT Secret is missing! Set 'jwt.secret' in application.properties or application.yml");
            }
            byte[] keyBytes = Base64.getDecoder().decode(secret);
            this.secretKey = Keys.hmacShaKeyFor(keyBytes);
            return this.secretKey;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid JWT Secret Key: " + e.getMessage(), e);
        }
    }

    public Long getExpiration() {
        return expiration;
    }
}


