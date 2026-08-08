package com.institution.bonafide.entity;

import com.institution.bonafide.entity.enums.RequestStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificate_requests")
public class CertificateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String certificateNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certificate_type_id", nullable = false)
    private CertificateType certificateType;

    @Column(nullable = false)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    private String hodRemarks;
    private String adminRemarks;

    private LocalDateTime requestedAt;
    private LocalDateTime hodApprovedAt;
    private LocalDateTime issuedAt;

    @Column(unique = true)
    private String qrVerificationHash;

    public CertificateRequest() {}

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public CertificateType getCertificateType() { return certificateType; }
    public void setCertificateType(CertificateType certificateType) { this.certificateType = certificateType; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getHodRemarks() { return hodRemarks; }
    public void setHodRemarks(String hodRemarks) { this.hodRemarks = hodRemarks; }

    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getHodApprovedAt() { return hodApprovedAt; }
    public void setHodApprovedAt(LocalDateTime hodApprovedAt) { this.hodApprovedAt = hodApprovedAt; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public String getQrVerificationHash() { return qrVerificationHash; }
    public void setQrVerificationHash(String qrVerificationHash) { this.qrVerificationHash = qrVerificationHash; }
}
