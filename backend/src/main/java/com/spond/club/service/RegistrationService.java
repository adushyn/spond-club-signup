package com.spond.club.service;

import com.spond.club.model.FieldValidationException;
import com.spond.club.model.Registration;
import com.spond.club.model.RegistrationRequest;
import com.spond.club.model.RegistrationUpdateRequest;
import com.spond.club.repository.RegistrationRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Business logic for membership registrations.
 * The controller only handles HTTP — all decisions live here.
 */
@Service
public class RegistrationService {

    private final RegistrationRepository repository;
    private final FormService            formService;
    private final TurnstileService       turnstileService;

    public RegistrationService(RegistrationRepository repository,
                               FormService formService,
                               TurnstileService turnstileService) {
        this.repository       = repository;
        this.formService      = formService;
        this.turnstileService = turnstileService;
    }

    /**
     * Validate and persist a registration.
     *
     * @throws FieldValidationException  if formId or memberTypeId are invalid
     * @throws SecurityException         if honeypot is filled or CAPTCHA fails
     * @throws DataIntegrityViolationException if email is already registered
     */
    @Transactional
    public Registration register(RegistrationRequest req, String remoteIp) {

        // Honeypot — silent bot rejection
        if (req.getWebsite() != null && !req.getWebsite().isBlank()) {
            throw new SecurityException("bot detected");
        }

        // Form ID must match the known form
        if (!formService.getForm().getFormId().equals(req.getFormId())) {
            throw new FieldValidationException("formId", "invalid form");
        }

        // Member type must be one of the defined options
        if (!formService.isValidMemberTypeId(req.getMemberTypeId())) {
            throw new FieldValidationException("memberTypeId", "invalid member type");
        }

        // Cloudflare Turnstile CAPTCHA
        if (!turnstileService.verify(req.getCfTurnstileResponse(), remoteIp)) {
            throw new SecurityException("CAPTCHA verification failed");
        }

        Registration reg = toEntity(req);
        return repository.save(reg);   // throws DataIntegrityViolationException on duplicate email
    }

    // ── Manage (view / edit / delete) ────────────────────────────────────────

    /** Find a registration by its UUID, or empty if not found. */
    public Optional<Registration> findById(UUID id) {
        return repository.findById(id);
    }

    /**
     * Update an existing registration.
     *
     * @throws EntityNotFoundException   if the registration does not exist
     * @throws FieldValidationException  if memberTypeId is invalid
     * @throws DataIntegrityViolationException if new email conflicts with another record
     */
    @Transactional
    public Registration update(UUID id, RegistrationUpdateRequest req) {
        Registration reg = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("registration not found"));

        if (!formService.isValidMemberTypeId(req.getMemberTypeId())) {
            throw new FieldValidationException("memberTypeId", "invalid member type");
        }

        reg.setMemberTypeId(req.getMemberTypeId());
        reg.setMemberTypeName(formService.getMemberTypeName(req.getMemberTypeId()));
        reg.setFirstName(req.getFirstName().trim());
        reg.setLastName(req.getLastName().trim());
        reg.setEmail(req.getEmail().trim().toLowerCase());
        reg.setPhone(req.getPhone().trim());
        reg.setBirthDate(req.getBirthDate());

        return repository.save(reg);
    }

    /**
     * Delete a registration by ID.
     * Returns true if the record existed and was deleted, false if it was already gone.
     * Both the existence check and the delete run in the same transaction, so
     * there is no TOCTOU window between them.
     */
    @Transactional
    public boolean delete(UUID id) {
        Optional<Registration> reg = repository.findById(id);
        if (reg.isEmpty()) return false;
        repository.delete(reg.get());
        return true;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Registration toEntity(RegistrationRequest req) {
        Registration reg = new Registration();
        reg.setFormId(req.getFormId());
        reg.setMemberTypeId(req.getMemberTypeId());
        reg.setMemberTypeName(formService.getMemberTypeName(req.getMemberTypeId()));
        reg.setFirstName(req.getFirstName().trim());
        reg.setLastName(req.getLastName().trim());
        reg.setEmail(req.getEmail().trim().toLowerCase());
        reg.setPhone(req.getPhone().trim());
        reg.setBirthDate(req.getBirthDate());
        return reg;
    }
}
