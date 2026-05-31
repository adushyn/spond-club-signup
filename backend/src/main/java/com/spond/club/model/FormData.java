package com.spond.club.model;

import java.time.Instant;
import java.util.List;

public class FormData {
    private String clubId;
    private List<MemberType> memberTypes;
    private String formId;
    private String title;
    private Instant registrationOpens;

    public FormData(String clubId, List<MemberType> memberTypes,
                    String formId, String title, Instant registrationOpens) {
        this.clubId = clubId;
        this.memberTypes = memberTypes;
        this.formId = formId;
        this.title = title;
        this.registrationOpens = registrationOpens;
    }

    public String getClubId()                { return clubId; }
    public List<MemberType> getMemberTypes() { return memberTypes; }
    public String getFormId()                { return formId; }
    public String getTitle()                 { return title; }
    public Instant getRegistrationOpens()    { return registrationOpens; }

    public record MemberType(String id, String name, String description) {}
}
