package com.spond.club.service;

import com.spond.club.model.FormData;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class FormService {

    private static final FormData FORM = new FormData(
        "britsport",
        List.of(
            new FormData.MemberType(
                "8FE4113D4E4020E0DCF887803A886981",
                "Active Member",
                "Full participation rights — compete in matches, train with the squad, and vote at club meetings."
            ),
            new FormData.MemberType(
                "4237C55C5CC3B4B082CBF2540612778E",
                "Social Member",
                "Support the club without competing — attend events, cheer on the team, and join club socials."
            )
        ),
        "B171388180BC457D9887AD92B6CCFC86",
        "Coding camp summer 2025",
        Instant.parse("2024-12-16T00:00:00Z")  // ← Registartion start date
    );

    public FormData getForm() { return FORM; }

    public boolean isValidMemberTypeId(String id) {
        return FORM.getMemberTypes().stream().anyMatch(mt -> mt.id().equals(id));
    }

    public String getMemberTypeName(String id) {
        return FORM.getMemberTypes().stream()
            .filter(mt -> mt.id().equals(id))
            .findFirst()
            .map(FormData.MemberType::name)
            .orElse("");
    }
}
