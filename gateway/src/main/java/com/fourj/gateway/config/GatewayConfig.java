package com.fourj.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(r -> r
                        .path("/api/user/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("userCircuitBreaker")
                                        .setFallbackUri("forward:/fallback")))
                        .uri("lb://user-service"))
                .route(r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("authCircuitBreaker")
                                        .setFallbackUri("forward:/fallback")))
                        .uri("lb://auth-service"))
                .route(r -> r
                        .path("/api/public/**")
                        .filters(f -> f
                                .stripPrefix(1))
                        .uri("lb://public-service"))
                .route(r -> r
                        .path("/api/v1/products/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(c -> c
                                        .setName("productCircuitBreaker")
                                        .setFallbackUri("forward:/fallback")))
                        .uri("lb://product-service"))
                .route(r -> r
                        .path("/api/v1/orders/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .circuitBreaker(c -> c
                                        .setName("orderCircuitBreaker")
                                        .setFallbackUri("forward:/fallback")))
                        .uri("lb://order-service"))
                .route(r -> r
                        .path("/fallback")
                        .uri("forward:/fallback-controller"))
                .build();
    }
    
    @Bean
    public RouteLocator fallbackRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(r -> r
                        .path("/fallback")
                        .uri("forward:/fallback-controller"))
                .route(r -> r
                        .path("/fallback-controller")
                        .uri("forward:/"))
                .build();
    }
} 