package com.spond.club.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class RegistrationUpdateRequest {

    @NotBlank
    private String memberTypeId;

    @NotBlank @Size(max = 100)
    private String firstName;

    @NotBlank @Size(max = 100)
    private String lastName;

    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotNull
    private LocalDate birthDate;

    public String getMemberTypeId() { return memberTypeId; }
    public void setMemberTypeId(String v) { this.memberTypeId = v; }

    public String getFirstName()    { return firstName; }
    public void setFirstName(String v) { this.firstName = v; }

    public String getLastName()     { return lastName; }
    public void setLastName(String v) { this.lastName = v; }

    public String getEmail()        { return email; }
    public void setEmail(String v)  { this.email = v; }

    public String getPhone()        { return phone; }
    public void setPhone(String v)  { this.phone = v; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate v) { this.birthDate = v; }
}
