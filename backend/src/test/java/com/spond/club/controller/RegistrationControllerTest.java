package com.spond.club.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.spond.club.model.FieldValidationException;
import com.spond.club.model.FormData;
import com.spond.club.model.Registration;
import com.spond.club.repository.RegistrationRepository;
import jakarta.persistence.EntityNotFoundException;
import com.spond.club.service.FormService;
import com.spond.club.service.TurnstileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.spond.club.model.RegistrationUpdateRequest;
import com.spond.club.service.RegistrationService;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Slice test for RegistrationController — web layer only, all dependencies mocked.
 *
 * Covers:
 *  - Happy path (201 Created)
 *  - Honeypot bot detection (403)
 *  - Invalid form ID (422)
 *  - Invalid member type ID (422)
 *  - Turnstile CAPTCHA failure (403)
 *  - Duplicate email (409 Conflict)
 *  - Bean-validation errors (422)
 */
@WebMvcTest(RegistrationController.class)
class RegistrationControllerTest {

    @Autowired private MockMvc mvc;
    @MockBean  private RegistrationRepository repository;
    @MockBean  private RegistrationService    registrationService;
    @MockBean  private FormService            formService;
    @MockBean  private TurnstileService       turnstileService;

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private static final String VALID_FORM_ID       = "FORM-ABC";
    private static final String VALID_MEMBER_TYPE   = "TYPE-ACTIVE";

    @BeforeEach
    void setUp() {
        // Default happy-path stubs
        FormData form = new FormData(
                "britsport",
                List.of(new FormData.MemberType(VALID_MEMBER_TYPE, "Active Member", "Full participation rights.")),
                VALID_FORM_ID,
                "Test Club",
                Instant.parse("2024-01-01T00:00:00Z")
        );
        when(formService.getForm()).thenReturn(form);
        when(formService.isValidMemberTypeId(VALID_MEMBER_TYPE)).thenReturn(true);
        when(formService.getMemberTypeName(VALID_MEMBER_TYPE)).thenReturn("Active Member");
        when(turnstileService.verify(any(), any())).thenReturn(true);
    }

    /** Build a valid registration payload as a Map. */
    private Map<String, Object> validPayload() {
        return Map.of(
                "formId",              VALID_FORM_ID,
                "memberTypeId",        VALID_MEMBER_TYPE,
                "firstName",           "Jane",
                "lastName",            "Doe",
                "email",               "jane@example.com",
                "phone",               "+44 7911 123456",
                "birthDate",           "1990-06-15",
                "website",             "",
                "cfTurnstileResponse", "test-token"
        );
    }

    private Registration savedRegistration() {
        Registration r = new Registration();
        r.setFormId(VALID_FORM_ID);
        r.setMemberTypeId(VALID_MEMBER_TYPE);
        r.setMemberTypeName("Active Member");
        r.setFirstName("Jane");
        r.setLastName("Doe");
        r.setEmail("jane@example.com");
        r.setPhone("+44 7911 123456");
        r.setBirthDate(LocalDate.of(1990, 6, 15));
        // Simulate auto-generated UUID
        try {
            var idField = Registration.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(r, UUID.randomUUID());
        } catch (Exception e) { /* ignore */ }
        return r;
    }

    // ── Happy path ────────────────────────────────────────────────────────────

    @Test
    void POST_registrations_returns201OnSuccess() throws Exception {
        when(registrationService.register(any(), any())).thenReturn(savedRegistration());

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validPayload())))
                .andExpect(status().isCreated());
    }

    @Test
    void POST_registrations_returnsIdOnSuccess() throws Exception {
        when(registrationService.register(any(), any())).thenReturn(savedRegistration());

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validPayload())))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    // ── Honeypot ──────────────────────────────────────────────────────────────

    @Test
    void POST_registrations_returns403WhenHoneypotFilled() throws Exception {
        when(registrationService.register(any(), any()))
                .thenThrow(new SecurityException("bot detected"));
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("website", "http://bot.example.com");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("bot detected"));
    }

    // ── Invalid form ID ───────────────────────────────────────────────────────

    @Test
    void POST_registrations_returns422ForInvalidFormId() throws Exception {
        when(registrationService.register(any(), any()))
                .thenThrow(new FieldValidationException("formId", "invalid form"));
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("formId", "WRONG-FORM");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("validation failed"));
    }

    // ── Invalid member type ───────────────────────────────────────────────────

    @Test
    void POST_registrations_returns422ForInvalidMemberType() throws Exception {
        when(registrationService.register(any(), any()))
                .thenThrow(new FieldValidationException("memberTypeId", "invalid member type"));
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("memberTypeId", "UNKNOWN-TYPE");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── CAPTCHA failure ───────────────────────────────────────────────────────

    @Test
    void POST_registrations_returns403WhenCaptchaFails() throws Exception {
        when(registrationService.register(any(), any()))
                .thenThrow(new SecurityException("CAPTCHA verification failed"));

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validPayload())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("CAPTCHA verification failed"));
    }

    // ── Duplicate email ───────────────────────────────────────────────────────

    @Test
    void POST_registrations_returns409ForDuplicateEmail() throws Exception {
        when(registrationService.register(any(), any())).thenThrow(new DataIntegrityViolationException("duplicate key"));

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validPayload())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value(
                        org.hamcrest.Matchers.containsString("already registered")));
    }

    // ── Bean validation ───────────────────────────────────────────────────────

    @Test
    void POST_registrations_returns422ForMissingFirstName() throws Exception {
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("firstName", "");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fields.firstName").exists());
    }

    @Test
    void POST_registrations_returns422ForInvalidEmail() throws Exception {
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("email", "not-an-email");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fields.email").exists());
    }

    @Test
    void POST_registrations_returns422ForMissingBirthDate() throws Exception {
        var payload = new java.util.HashMap<>(validPayload());
        payload.remove("birthDate");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void POST_registrations_returns422ForFutureBirthDate() throws Exception {
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("birthDate", LocalDate.now().plusYears(1).toString());

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fields.birthDate").exists());
    }

    @Test
    void POST_registrations_returns422ForInvalidPhone() throws Exception {
        var payload = new java.util.HashMap<>(validPayload());
        payload.put("phone", "abc");

        mvc.perform(post("/api/registrations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fields.phone").exists());
    }

    // ── GET /api/registrations/{id} ───────────────────────────────────────────

    @Test
    void GET_registration_returns200WithBody() throws Exception {
        when(registrationService.findById(any(UUID.class)))
                .thenReturn(Optional.of(savedRegistration()));

        mvc.perform(get("/api/registrations/{id}", UUID.randomUUID()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void GET_registration_returns404WhenNotFound() throws Exception {
        when(registrationService.findById(any(UUID.class))).thenReturn(Optional.empty());

        mvc.perform(get("/api/registrations/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    // ── PUT /api/registrations/{id} ───────────────────────────────────────────

    @Test
    void PUT_registration_returns200WithUpdatedBody() throws Exception {
        Registration updated = savedRegistration();
        updated.setFirstName("Alice");
        when(registrationService.update(any(UUID.class), any(RegistrationUpdateRequest.class)))
                .thenReturn(updated);

        var payload = Map.of(
                "memberTypeId", VALID_MEMBER_TYPE,
                "firstName",    "Alice",
                "lastName",     "Doe",
                "email",        "alice@example.com",
                "phone",        "+44 7911 123456",
                "birthDate",    "1990-06-15"
        );

        mvc.perform(put("/api/registrations/{id}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"));
    }

    @Test
    void PUT_registration_returns404WhenNotFound() throws Exception {
        when(registrationService.update(any(UUID.class), any(RegistrationUpdateRequest.class)))
                .thenThrow(new EntityNotFoundException("registration not found"));

        var payload = Map.of(
                "memberTypeId", VALID_MEMBER_TYPE,
                "firstName",    "Alice",
                "lastName",     "Doe",
                "email",        "alice@example.com",
                "phone",        "+44 7911 123456",
                "birthDate",    "1990-06-15"
        );

        mvc.perform(put("/api/registrations/{id}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }

    @Test
    void PUT_registration_returns409ForDuplicateEmail() throws Exception {
        when(registrationService.update(any(UUID.class), any(RegistrationUpdateRequest.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key"));

        var payload = Map.of(
                "memberTypeId", VALID_MEMBER_TYPE,
                "firstName",    "Jane",
                "lastName",     "Doe",
                "email",        "taken@example.com",
                "phone",        "+44 7911 123456",
                "birthDate",    "1990-06-15"
        );

        mvc.perform(put("/api/registrations/{id}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(payload)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value(
                        org.hamcrest.Matchers.containsString("already registered")));
    }

    // ── DELETE /api/registrations/{id} ────────────────────────────────────────

    @Test
    void DELETE_registration_returns204OnSuccess() throws Exception {
        UUID id = UUID.randomUUID();
        when(registrationService.delete(id)).thenReturn(true);

        mvc.perform(delete("/api/registrations/{id}", id))
                .andExpect(status().isNoContent());
    }

    @Test
    void DELETE_registration_returns404WhenNotFound() throws Exception {
        when(registrationService.delete(any(UUID.class))).thenReturn(false);

        mvc.perform(delete("/api/registrations/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }
}
