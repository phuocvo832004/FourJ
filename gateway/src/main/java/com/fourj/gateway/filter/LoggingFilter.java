package com.fourj.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        
        return chain.filter(exchange)
                .doFinally(signalType -> {
                    long totalTime = System.currentTimeMillis() - startTime;
                    log.info("Request: {} {} - Response: {} - Time: {}ms",
                            exchange.getRequest().getMethod(),
                            exchange.getRequest().getPath(),
                            exchange.getResponse().getStatusCode(),
                            totalTime);
                });
    }

    @Override
    public int getOrder() {
        return -200; // Chạy sau AuthenticationFilter
    }
} 