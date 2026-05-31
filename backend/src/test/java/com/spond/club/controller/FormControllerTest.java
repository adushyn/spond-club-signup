package com.spond.club.controller;

import com.spond.club.model.FormData;
import com.spond.club.service.FormService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Slice test for FormController — only the web layer is loaded.
 * FormService is mocked.
 */
@WebMvcTest(FormController.class)
class FormControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private FormService formService;

    private FormData sampleForm() {
        return new FormData(
                "britsport",
                List.of(
                        new FormData.MemberType("TYPE-1", "Active Member", "Full participation rights."),
                        new FormData.MemberType("TYPE-2", "Social Member", "Support the club without competing.")
                ),
                "FORM-ABC",
                "Test Club 2025",
                Instant.parse("2024-01-01T00:00:00Z")
        );
    }

    @Test
    void GET_form_returns200() throws Exception {
        when(formService.getForm()).thenReturn(sampleForm());

        mvc.perform(get("/api/form"))
                .andExpect(status().isOk());
    }

    @Test
    void GET_form_returnsJsonContentType() throws Exception {
        when(formService.getForm()).thenReturn(sampleForm());

        mvc.perform(get("/api/form"))
                .andExpect(content().contentTypeCompatibleWith("application/json"));
    }

    @Test
    void GET_form_includesFormId() throws Exception {
        when(formService.getForm()).thenReturn(sampleForm());

        mvc.perform(get("/api/form"))
                .andExpect(jsonPath("$.formId").value("FORM-ABC"));
    }

    @Test
    void GET_form_includesTitle() throws Exception {
        when(formService.getForm()).thenReturn(sampleForm());

        mvc.perform(get("/api/form"))
                .andExpect(jsonPath("$.title").value("Test Club 2025"));
    }

    @Test
    void GET_form_includesMemberTypes() throws Exception {
        when(formService.getForm()).thenReturn(sampleForm());

        mvc.perform(get("/api/form"))
                .andExpect(jsonPath("$.memberTypes").isArray())
                .andExpect(jsonPath("$.memberTypes.length()").value(2))
                .andExpect(jsonPath("$.memberTypes[0].name").value("Active Member"))
                .andExpect(jsonPath("$.memberTypes[0].description").isNotEmpty())
                .andExpect(jsonPath("$.memberTypes[1].description").isNotEmpty());
    }

    @Test
    void GET_form_includesCacheControlHeader() throws Exception {
        when(formService.getForm()).thenReturn(sampleForm());

        mvc.perform(get("/api/form"))
                .andExpect(header().exists("Cache-Control"));
    }
}
