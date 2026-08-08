package com.institution.bonafide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CertificateRequestDto {
    @NotNull
    private Long certificateTypeId;

    @NotBlank
    private String purpose;

    public Long getCertificateTypeId() { return certificateTypeId; }
    public void setCertificateTypeId(Long certificateTypeId) { this.certificateTypeId = certificateTypeId; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
