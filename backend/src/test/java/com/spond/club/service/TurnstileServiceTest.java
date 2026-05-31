package com.spond.club.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TurnstileService.
 * RestTemplate is now injected via constructor — no reflection tricks needed.
 */
@ExtendWith(MockitoExtension.class)
class TurnstileServiceTest {

    private static final String VERIFY_URL =
            "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Build a service with a real (no-op) RestTemplate and blank secret. */
    private TurnstileService serviceWithBlankSecret() {
        TurnstileService svc = new TurnstileService(mock(RestTemplate.class));
        ReflectionTestUtils.setField(svc, "secret", "");
        ReflectionTestUtils.setField(svc, "verifyUrl", VERIFY_URL);
        return svc;
    }

    /** Build a service with a mock RestTemplate and a real secret. */
    private TurnstileService serviceWithMockRt(RestTemplate mockRt) {
        TurnstileService svc = new TurnstileService(mockRt);
        ReflectionTestUtils.setField(svc, "secret", "test-secret");
        ReflectionTestUtils.setField(svc, "verifyUrl", VERIFY_URL);
        return svc;
    }

    private void stubResponse(RestTemplate mockRt, boolean success) {
        try {
            var json = success
                    ? "{\"success\":true,\"error-codes\":[]}"
                    : "{\"success\":false,\"error-codes\":[\"invalid-input-response\"]}";
            when(mockRt.postForObject(anyString(), any(), any()))
                    .thenAnswer(inv -> new ObjectMapper().readValue(json, (Class<?>) inv.getArgument(2)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ── No secret (local dev) ─────────────────────────────────────────────────

    @Test
    void skipsCheckAndReturnsTrueWhenSecretIsBlank() {
        assertThat(serviceWithBlankSecret().verify("any-token", "1.2.3.4")).isTrue();
    }

    @Test
    void skipsCheckAndReturnsTrueWhenSecretIsNull() {
        TurnstileService svc = new TurnstileService(mock(RestTemplate.class));
        ReflectionTestUtils.setField(svc, "secret", null);
        ReflectionTestUtils.setField(svc, "verifyUrl", VERIFY_URL);
        assertThat(svc.verify("any-token", "1.2.3.4")).isTrue();
    }

    // ── With secret — mock the injected RestTemplate ──────────────────────────

    @Test
    void returnsTrueWhenCloudflareReturnsSuccess() {
        RestTemplate mockRt = mock(RestTemplate.class);
        stubResponse(mockRt, true);
        assertThat(serviceWithMockRt(mockRt).verify("valid-token", "1.2.3.4")).isTrue();
    }

    @Test
    void returnsFalseWhenCloudflareReturnsFail() {
        RestTemplate mockRt = mock(RestTemplate.class);
        stubResponse(mockRt, false);
        assertThat(serviceWithMockRt(mockRt).verify("bad-token", "1.2.3.4")).isFalse();
    }

    @Test
    void returnsFalseWhenRestCallThrows() {
        RestTemplate mockRt = mock(RestTemplate.class);
        when(mockRt.postForObject(anyString(), any(), any()))
                .thenThrow(new RestClientException("network error"));
        assertThat(serviceWithMockRt(mockRt).verify("token", "1.2.3.4")).isFalse();
    }

    @Test
    void returnsFalseWhenCloudflareResponseIsNull() {
        RestTemplate mockRt = mock(RestTemplate.class);
        when(mockRt.postForObject(anyString(), any(), any())).thenReturn(null);
        assertThat(serviceWithMockRt(mockRt).verify("token", "1.2.3.4")).isFalse();
    }

    @Test
    void toleratesNullIpAddress() {
        assertThatCode(() -> serviceWithBlankSecret().verify("token", null))
                .doesNotThrowAnyException();
    }
}
