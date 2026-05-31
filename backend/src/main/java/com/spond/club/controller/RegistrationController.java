package com.spond.club.controller;

import com.spond.club.model.FieldValidationException;
import com.spond.club.model.Registration;
import com.spond.club.model.RegistrationRequest;
import com.spond.club.model.RegistrationUpdateRequest;
import com.spond.club.service.RegistrationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Thin HTTP layer — parses requests, returns responses.
 * All business logic lives in RegistrationService.
 */
@RestController
@RequestMapping("/api")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/registrations")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegistrationRequest req,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null) ip = httpRequest.getRemoteAddr();

        try {
            var saved = registrationService.register(req, ip);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "id",      saved.getId().toString(),
                            "message", "Registration successful! Welcome to the club."
                    ));
        } catch (SecurityException e) {
            String msg = e.getMessage();
            if ("bot detected".equals(msg)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "bot detected"));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", msg));
        } catch (FieldValidationException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("error", "validation failed",
                                 "fields", Map.of(e.getField(), e.getMessage())));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "this email address is already registered for this form"));
        }
    }

    // ── GET /api/registrations/{id} ──────────────────────────────────────────

    @GetMapping("/registrations/{id}")
    public ResponseEntity<?> getRegistration(@PathVariable UUID id) {
        return registrationService.findById(id)
                .map(reg -> ResponseEntity.ok(toDto(reg)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── PUT /api/registrations/{id} ──────────────────────────────────────────

    @PutMapping("/registrations/{id}")
    public ResponseEntity<?> updateRegistration(
            @PathVariable UUID id,
            @Valid @RequestBody RegistrationUpdateRequest req) {

        try {
            var updated = registrationService.update(id, req);
            return ResponseEntity.ok(toDto(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (FieldValidationException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("error", "validation failed",
                                 "fields", Map.of(e.getField(), e.getMessage())));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "this email address is already registered for this form"));
        }
    }

    // ── DELETE /api/registrations/{id} ───────────────────────────────────────

    @DeleteMapping("/registrations/{id}")
    public ResponseEntity<?> deleteRegistration(@PathVariable UUID id) {
        return registrationService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> toDto(Registration reg) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id",             reg.getId().toString());
        dto.put("memberTypeId",   reg.getMemberTypeId());
        dto.put("memberTypeName", reg.getMemberTypeName());
        dto.put("firstName",      reg.getFirstName());
        dto.put("lastName",       reg.getLastName());
        dto.put("email",          reg.getEmail());
        dto.put("phone",          reg.getPhone());
        dto.put("birthDate",      reg.getBirthDate().toString());
        dto.put("submittedAt",    reg.getSubmittedAt().toString());
        return dto;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fields.put(fe.getField(), fe.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("error", "validation failed", "fields", fields));
    }
}
