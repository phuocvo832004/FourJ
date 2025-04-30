package com.fourj.productservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
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

    @Value("${auth0.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;
    
    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;
    
    @Autowired
    private PublicEndpointsConfig.PublicEndpointsFilter publicEndpointsFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Đặt cấu hình không tạo session
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        // Vô hiệu hóa CSRF và cấu hình CORS
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()));
            
        // Thêm bộ lọc public endpoints trước bộ lọc OAuth2
        http.addFilterBefore(publicEndpointsFilter, BasicAuthenticationFilter.class);
        
        // Cấu hình các quy tắc yêu cầu HTTP
        http.authorizeHttpRequests(auth -> auth
            // Các endpoint public
            .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll() 
            .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
            .requestMatchers("/actuator/**").permitAll()
            
            // Các endpoint cho seller
            .requestMatchers("/api/seller/products/**").hasAuthority("seller:access")
            
            // Các endpoint cho admin
            .requestMatchers("/api/admin/**").hasAuthority("admin:access")
            
            // Các endpoint cũ cần quyền write:products
            .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/categories/**").hasAnyAuthority("write:products", "admin:access")
            .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/categories/**").hasAnyAuthority("write:products", "admin:access")
            .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasAnyAuthority("write:products", "admin:access")
            
            // Tất cả các endpoint khác yêu cầu xác thực
            .anyRequest().authenticated()
        );

        return http.build();
    }
    
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Thay thế allowedOrigins bằng allowedOriginPatterns khi allowCredentials là true
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}