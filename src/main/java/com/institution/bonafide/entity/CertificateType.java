package com.institution.bonafide.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "certificate_types")
public class CertificateType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private boolean requiresHodApproval = true;

    public CertificateType() {}

    public CertificateType(String title, String description, boolean requiresHodApproval) {
        this.title = title;
        this.description = description;
        this.requiresHodApproval = requiresHodApproval;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isRequiresHodApproval() { return requiresHodApproval; }
    public void setRequiresHodApproval(boolean requiresHodApproval) { this.requiresHodApproval = requiresHodApproval; }
}
