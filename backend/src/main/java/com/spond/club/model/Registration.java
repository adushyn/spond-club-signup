package com.spond.club.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "registrations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"email", "form_id"}))
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "form_id",          nullable = false) private String formId;
    @Column(name = "member_type_id",   nullable = false) private String memberTypeId;
    @Column(name = "member_type_name", nullable = false) private String memberTypeName;
    @Column(name = "first_name",       nullable = false) private String firstName;
    @Column(name = "last_name",        nullable = false) private String lastName;
    @Column(nullable = false)                            private String email;
    @Column(nullable = false)                            private String phone;
    @Column(name = "birth_date",       nullable = false) private LocalDate birthDate;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private OffsetDateTime submittedAt = OffsetDateTime.now();

    public UUID getId()                        { return id; }
    public String getFormId()                  { return formId; }
    public void setFormId(String v)            { this.formId = v; }
    public String getMemberTypeId()            { return memberTypeId; }
    public void setMemberTypeId(String v)      { this.memberTypeId = v; }
    public String getMemberTypeName()          { return memberTypeName; }
    public void setMemberTypeName(String v)    { this.memberTypeName = v; }
    public String getFirstName()               { return firstName; }
    public void setFirstName(String v)         { this.firstName = v; }
    public String getLastName()                { return lastName; }
    public void setLastName(String v)          { this.lastName = v; }
    public String getEmail()                   { return email; }
    public void setEmail(String v)             { this.email = v; }
    public String getPhone()                   { return phone; }
    public void setPhone(String v)             { this.phone = v; }
    public LocalDate getBirthDate()            { return birthDate; }
    public void setBirthDate(LocalDate v)      { this.birthDate = v; }
    public OffsetDateTime getSubmittedAt()     { return submittedAt; }
}
