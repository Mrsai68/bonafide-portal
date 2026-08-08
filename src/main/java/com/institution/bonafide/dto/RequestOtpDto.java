package com.institution.bonafide.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RequestOtpDto {

    @NotBlank
    @Email
    private String email;

    public RequestOtpDto() {}

    public RequestOtpDto(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
