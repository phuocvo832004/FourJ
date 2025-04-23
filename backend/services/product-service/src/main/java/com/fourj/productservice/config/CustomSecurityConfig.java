package com.fourj.productservice.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.Arrays;
import java.util.List;

/**
 * Cấu hình bổ sung cho OAuth2 Resource Server
 * Giải quyết vấn đề với endpoint public
 */
@Configuration
public class CustomSecurityConfig {

    /**
     * Tùy chỉnh BearerTokenResolver không yêu cầu token cho public endpoints
     */
    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver bearerTokenResolver = new DefaultBearerTokenResolver();
        bearerTokenResolver.setBearerTokenHeaderName("Authorization");
        
        return new PublicEndpointAwareBearerTokenResolver(bearerTokenResolver);
    }
    
    /**
     * BearerTokenResolver tùy chỉnh để bỏ qua việc yêu cầu token với public endpoints
     */
    public static class PublicEndpointAwareBearerTokenResolver implements BearerTokenResolver {
        private final RequestMatcher publicEndpoints;
        private final BearerTokenResolver delegate;
        
        public PublicEndpointAwareBearerTokenResolver(BearerTokenResolver delegate) {
            List<RequestMatcher> matchers = Arrays.asList(
                    new AntPathRequestMatcher("/api/products", HttpMethod.GET.name()),
                    new AntPathRequestMatcher("/api/products/**", HttpMethod.GET.name()),
                    new AntPathRequestMatcher("/api/categories", HttpMethod.GET.name()),
                    new AntPathRequestMatcher("/api/categories/**", HttpMethod.GET.name()),
                    new AntPathRequestMatcher("/actuator/**")
            );
            this.publicEndpoints = new OrRequestMatcher(matchers);
            this.delegate = delegate;
        }
        
        @Override
        public String resolve(HttpServletRequest request) {
            // Với public endpoints, không yêu cầu token
            if (publicEndpoints.matches(request)) {
                return null;
            }
            
            // Với các endpoints khác, phân giải token như thông thường
            return delegate.resolve(request);
        }
    }
} 