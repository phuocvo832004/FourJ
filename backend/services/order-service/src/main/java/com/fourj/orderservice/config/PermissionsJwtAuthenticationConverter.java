package com.fourj.orderservice.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PermissionsJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private static final Logger logger = LoggerFactory.getLogger(PermissionsJwtAuthenticationConverter.class);
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.concat(
                defaultConverter.convert(jwt).stream(),
                extractPermissions(jwt).stream()
        ).collect(Collectors.toSet());

        logger.debug("JWT converted with authorities: {}", authorities);
        return new JwtAuthenticationToken(jwt, authorities);
    }

    private Collection<GrantedAuthority> extractPermissions(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        // Log JWT claims for debugging
        logger.debug("Processing JWT with claims: {}", jwt.getClaims().keySet());
        
        // Thêm quyền từ "permissions" claim
        if (jwt.hasClaim("permissions")) {
            List<String> permissions = jwt.getClaim("permissions");
            logger.debug("Found permissions in JWT: {}", permissions);
            
            authorities.addAll(
                    permissions.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList())
            );
        } else {
            logger.debug("No 'permissions' claim found in JWT");
        }

        // Thêm quyền từ custom namespace claim nếu có
        Map<String, Object> claims = jwt.getClaims();
        for (String key : claims.keySet()) {
            if (key.endsWith("/permissions")) {
                logger.debug("Found custom permissions in claim: {}", key);
                
                if (claims.get(key) instanceof List) {
                    List<?> permissions = (List<?>) claims.get(key);
                    for (Object permission : permissions) {
                        if (permission instanceof String) {
                            authorities.add(new SimpleGrantedAuthority((String) permission));
                            logger.debug("Added authority: {}", permission);
                        }
                    }
                }
            }
        }

        if (authorities.isEmpty()) {
            logger.warn("No authorities were extracted from the JWT");
        } else {
            logger.debug("Extracted authorities: {}", authorities);
        }
        
        return authorities;
    }
} 