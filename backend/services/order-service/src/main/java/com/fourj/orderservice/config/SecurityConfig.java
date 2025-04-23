package com.fourj.orderservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${auth0.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;
    
    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;
    
    @Autowired
    private PublicEndpointsConfig.PublicEndpointsFilter publicEndpointsFilter;
    
    @Autowired
    private BearerTokenResolver bearerTokenResolver;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security with audience: {} and issuer: {}", audience, issuer);
        
        // Đặt cấu hình không tạo session
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        // Vô hiệu hóa CSRF và cấu hình CORS
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()));
            
        // Thêm bộ lọc public endpoints trước bộ lọc OAuth2
        http.addFilterBefore(publicEndpointsFilter, BasicAuthenticationFilter.class);
        
        // Cấu hình các quy tắc yêu cầu HTTP
        http.authorizeHttpRequests(auth -> auth
            // Public endpoints
            .requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()
            .requestMatchers("/actuator/**", 
                           "/checkout/orders/cancel", 
                           "/checkout/orders/success").permitAll()
            
            // Admin chỉ có thể truy cập API quản trị
            .requestMatchers("/api/admin/**").hasAuthority("admin:access")
            
            // Seller chỉ có thể truy cập API của seller
            .requestMatchers("/api/seller/**").hasAuthority("seller:access")
            
            // Tất cả các endpoint còn lại yêu cầu xác thực
            .anyRequest().authenticated()
        );
        
        // Cấu hình OAuth2 Resource Server với BearerTokenResolver tùy chỉnh
        http.oauth2ResourceServer(oauth2 -> oauth2
            .bearerTokenResolver(bearerTokenResolver)
            .jwt(jwt -> jwt.jwtAuthenticationConverter(new PermissionsJwtAuthenticationConverter()))
        );
        
        return http.build();
    }
    
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Thay thế allowedOrigins bằng allowedOriginPatterns khi allowCredentials là true
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        logger.info("Initializing JWT Decoder with audience: {}, issuer: {}", audience, issuer);
        
        try {
            NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer);
            OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(audience);
            OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);
            OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);
            
            jwtDecoder.setJwtValidator(withAudience);
            
            logger.info("JWT Decoder configured successfully");
            return jwtDecoder;
        } catch (Exception e) {
            logger.error("Error configuring JWT Decoder: {}", e.getMessage(), e);
            throw e;
        }
    }
}