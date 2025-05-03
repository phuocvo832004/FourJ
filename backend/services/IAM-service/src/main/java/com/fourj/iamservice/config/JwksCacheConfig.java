package com.fourj.iamservice.config;

import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.DefaultResourceRetriever;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.MalformedURLException;
import java.net.URL;

@Configuration
@Slf4j
public class JwksCacheConfig {

    @Value("${auth0.domain}")
    private String domain;

    @Value("${jwks.connect-timeout:2000}")
    private int connectTimeout;
    
    @Value("${jwks.read-timeout:2000}")
    private int readTimeout;
    
    @Value("${jwks.cache-size:10}")
    private int cacheSize;

    @Bean
    public JWKSource<SecurityContext> jwkSource() throws MalformedURLException {
        String jwkSetUrl = "https://" + domain + "/.well-known/jwks.json";
        log.info("Configuring JWK source with URL: {}", jwkSetUrl);
        
        // Cấu hình timeout và cache
        DefaultResourceRetriever resourceRetriever = 
            new DefaultResourceRetriever(connectTimeout, readTimeout, cacheSize);
            
        return new RemoteJWKSet<>(new URL(jwkSetUrl), resourceRetriever);
    }
}