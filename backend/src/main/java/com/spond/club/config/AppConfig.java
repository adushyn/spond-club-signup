package com.spond.club.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Shared RestTemplate bean with sensible timeouts.
     * Injected into TurnstileService via constructor — easy to mock in tests.
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3_000);  // 3 s to establish connection
        factory.setReadTimeout(5_000);     // 5 s to read response
        return new RestTemplate(factory);
    }
}
