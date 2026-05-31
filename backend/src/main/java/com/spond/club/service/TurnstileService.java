package com.spond.club.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class TurnstileService {

    private static final Logger log = LoggerFactory.getLogger(TurnstileService.class);

    @Value("${turnstile.secret:}")
    private String secret;

    @Value("${turnstile.verify-url}")
    private String verifyUrl;

    private final RestTemplate restTemplate;

    /** RestTemplate injected as a Spring bean (configured with timeouts in AppConfig). */
    public TurnstileService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean verify(String token, String remoteIp) {
        if (secret == null || secret.isBlank()) {
            log.warn("CF_TURNSTILE_SECRET not set — skipping CAPTCHA (local dev)");
            return true;
        }
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", secret);
        params.add("response", token);
        if (remoteIp != null && !remoteIp.isBlank()) params.add("remoteip", remoteIp);
        try {
            TurnstileResponse resp = restTemplate.postForObject(verifyUrl, params, TurnstileResponse.class);
            return resp != null && resp.success();
        } catch (Exception e) {
            log.error("Turnstile verification failed", e);
            return false;
        }
    }

    private record TurnstileResponse(
        boolean success,
        @JsonProperty("error-codes") String[] errorCodes
    ) {}
}
