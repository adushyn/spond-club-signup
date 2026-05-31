package com.spond.club.service;

import com.spond.club.model.FormData;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for FormService — no Spring context needed.
 */
class FormServiceTest {

    private final FormService service = new FormService();

    // ── getForm ───────────────────────────────────────────────────────────────

    @Test
    void getForm_returnsNonNull() {
        assertThat(service.getForm()).isNotNull();
    }

    @Test
    void getForm_hasFormId() {
        assertThat(service.getForm().getFormId()).isNotBlank();
    }

    @Test
    void getForm_hasTwoMemberTypes() {
        List<FormData.MemberType> types = service.getForm().getMemberTypes();
        assertThat(types).hasSize(2);
    }

    @Test
    void getForm_memberTypeIdsAreUnique() {
        List<String> ids = service.getForm().getMemberTypes()
                .stream().map(FormData.MemberType::id).toList();
        assertThat(ids).doesNotHaveDuplicates();
    }

    @Test
    void getForm_memberTypeNamesAreNotBlank() {
        service.getForm().getMemberTypes()
                .forEach(mt -> assertThat(mt.name()).isNotBlank());
    }

    @Test
    void getForm_hasTitleAndClubId() {
        FormData form = service.getForm();
        assertThat(form.getTitle()).isNotBlank();
        assertThat(form.getClubId()).isNotBlank();
    }

    @Test
    void getForm_registrationOpensIsSet() {
        assertThat(service.getForm().getRegistrationOpens()).isNotNull();
    }

    // ── isValidMemberTypeId ───────────────────────────────────────────────────

    @Test
    void isValidMemberTypeId_returnsTrueForKnownId() {
        String knownId = service.getForm().getMemberTypes().get(0).id();
        assertThat(service.isValidMemberTypeId(knownId)).isTrue();
    }

    @Test
    void isValidMemberTypeId_returnsFalseForUnknownId() {
        assertThat(service.isValidMemberTypeId("DOES-NOT-EXIST")).isFalse();
    }

    @Test
    void isValidMemberTypeId_returnsFalseForEmptyString() {
        assertThat(service.isValidMemberTypeId("")).isFalse();
    }

    @Test
    void isValidMemberTypeId_returnsFalseForNull() {
        assertThat(service.isValidMemberTypeId(null)).isFalse();
    }

    @Test
    void isValidMemberTypeId_returnsTrueForAllDefinedTypes() {
        service.getForm().getMemberTypes()
                .forEach(mt -> assertThat(service.isValidMemberTypeId(mt.id())).isTrue());
    }

    // ── getMemberTypeName ─────────────────────────────────────────────────────

    @Test
    void getMemberTypeName_returnsCorrectNameForKnownId() {
        FormData.MemberType first = service.getForm().getMemberTypes().get(0);
        assertThat(service.getMemberTypeName(first.id())).isEqualTo(first.name());
    }

    @Test
    void getMemberTypeName_returnsEmptyStringForUnknownId() {
        assertThat(service.getMemberTypeName("UNKNOWN")).isEmpty();
    }

    @Test
    void getMemberTypeName_returnsNamesForAllTypes() {
        service.getForm().getMemberTypes().forEach(mt ->
                assertThat(service.getMemberTypeName(mt.id())).isEqualTo(mt.name())
        );
    }
}
