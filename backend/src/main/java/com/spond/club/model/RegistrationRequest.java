package com.spond.club.model;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class RegistrationRequest {

    @NotBlank(message = "formId is required")
    private String formId;

    @NotBlank(message = "memberTypeId is required")
    private String memberTypeId;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name is too long")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name is too long")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Phone is required")
    // Must match the format emitted by the frontend PhoneInput: "+<1–4 digit code> <local number>"
    // e.g. "+47 123 45 678", "+1 5551234567", "+358 40 123 4567"
    @Pattern(regexp = "^\\+\\d{1,4}\\s[0-9\\s\\-().]{4,18}$", message = "Invalid phone number")
    private String phone;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate birthDate;

    private String website = "";              // honeypot
    private String cfTurnstileResponse = "";  // CAPTCHA token

    public String getFormId()                         { return formId; }
    public void setFormId(String v)                   { this.formId = v; }
    public String getMemberTypeId()                   { return memberTypeId; }
    public void setMemberTypeId(String v)             { this.memberTypeId = v; }
    public String getFirstName()                      { return firstName; }
    public void setFirstName(String v)                { this.firstName = v; }
    public String getLastName()                       { return lastName; }
    public void setLastName(String v)                 { this.lastName = v; }
    public String getEmail()                          { return email; }
    public void setEmail(String v)                    { this.email = v; }
    public String getPhone()                          { return phone; }
    public void setPhone(String v)                    { this.phone = v; }
    public LocalDate getBirthDate()                   { return birthDate; }
    public void setBirthDate(LocalDate v)             { this.birthDate = v; }
    public String getWebsite()                        { return website; }
    public void setWebsite(String v)                  { this.website = v; }
    public String getCfTurnstileResponse()            { return cfTurnstileResponse; }
    public void setCfTurnstileResponse(String v)      { this.cfTurnstileResponse = v; }
}
