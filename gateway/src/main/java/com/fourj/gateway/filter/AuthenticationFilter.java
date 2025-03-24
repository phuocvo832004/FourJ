package com.fourj.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    // Danh sách các đường dẫn public không yêu cầu xác thực
    private final List<String> publicPaths = Arrays.asList(
            "/api/public/",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh-token",
            "/api/products/",
            "/api/v1/products/",
            "/fallback"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();
        
        // Kiểm tra nếu là public endpoint
        for (String publicPath : publicPaths) {
            if (path.startsWith(publicPath)) {
                return chain.filter(exchange);
            }
        }

        // Kiểm tra token trong header
        String token = request.getHeaders().getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Thêm token vào request headers để forward đến các service
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("Authorization", token)
                .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    @Override
    public int getOrder() {
        return -100;
    }
} 