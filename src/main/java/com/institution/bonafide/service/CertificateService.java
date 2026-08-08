package com.institution.bonafide.service;

import com.institution.bonafide.dto.ApprovalRequestDto;
import com.institution.bonafide.dto.CertificateRequestDto;
import com.institution.bonafide.dto.VerificationResponseDto;
import com.institution.bonafide.entity.CertificateRequest;
import com.institution.bonafide.entity.CertificateType;
import com.institution.bonafide.entity.User;
import com.institution.bonafide.entity.enums.RequestStatus;
import com.institution.bonafide.repository.CertificateRequestRepository;
import com.institution.bonafide.repository.CertificateTypeRepository;
import com.institution.bonafide.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRequestRepository certificateRequestRepository;

    @Autowired
    private CertificateTypeRepository certificateTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public CertificateRequest createRequest(String username, CertificateRequestDto dto) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        CertificateType certType = certificateTypeRepository.findById(dto.getCertificateTypeId())
                .orElseThrow(() -> new RuntimeException("Certificate type not found"));

        String certNum = "CERT-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String hash = generateHash(student.getUsername() + ":" + certNum + ":" + System.currentTimeMillis());

        CertificateRequest req = new CertificateRequest();
        req.setCertificateNumber(certNum);
        req.setStudent(student);
        req.setCertificateType(certType);
        req.setPurpose(dto.getPurpose());
        req.setQrVerificationHash(hash);
        req.setStatus(RequestStatus.PENDING_HOD_APPROVAL);

        return certificateRequestRepository.save(req);
    }

    public List<CertificateRequest> getStudentRequests(String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return certificateRequestRepository.findByStudentIdOrderByRequestedAtDesc(student.getId());
    }

    public List<CertificateRequest> getHodPendingRequests(String hodUsername) {
        User hod = userRepository.findByUsername(hodUsername)
                .orElseThrow(() -> new RuntimeException("HOD not found"));
        return certificateRequestRepository.findByStudentDepartmentAndStatus(hod.getDepartment(), RequestStatus.PENDING_HOD_APPROVAL);
    }

    @Transactional
    public CertificateRequest processHodApproval(Long requestId, String hodUsername, ApprovalRequestDto dto) {
        CertificateRequest req = certificateRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setHodRemarks(dto.getRemarks());
        if (dto.isApproved()) {
            boolean isBonafide = req.getCertificateType().getTitle().toLowerCase().contains("bonafide");
            if (isBonafide) {
                // Bonafide 1-Step Approval: HOD approval directly issues document & generates PDF
                req.setStatus(RequestStatus.ISSUED_BY_ADMIN);
                req.setHodApprovedAt(LocalDateTime.now());
                req.setIssuedAt(LocalDateTime.now());
                req.setAdminRemarks("Issued via HOD 1-Step Approval");
            } else {
                // Other documents: 2-Step Approval (Requires Central Office Issue)
                req.setStatus(RequestStatus.APPROVED_BY_HOD);
                req.setHodApprovedAt(LocalDateTime.now());
            }
        } else {
            req.setStatus(RequestStatus.REJECTED_BY_HOD);
        }

        return certificateRequestRepository.save(req);
    }

    public List<CertificateRequest> getAdminPendingIssuance() {
        return certificateRequestRepository.findByStatusOrderByRequestedAtAsc(RequestStatus.APPROVED_BY_HOD);
    }

    @Transactional
    public CertificateRequest processAdminIssuance(Long requestId, ApprovalRequestDto dto) {
        CertificateRequest req = certificateRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setAdminRemarks(dto.getRemarks());
        if (dto.isApproved()) {
            req.setStatus(RequestStatus.ISSUED_BY_ADMIN);
            req.setIssuedAt(LocalDateTime.now());
        } else {
            req.setStatus(RequestStatus.REJECTED_BY_ADMIN);
        }

        return certificateRequestRepository.save(req);
    }

    public VerificationResponseDto verifyCertificate(String certificateNumber) {
        return certificateRequestRepository.findByCertificateNumber(certificateNumber)
                .or(() -> certificateRequestRepository.findByQrVerificationHash(certificateNumber))
                .map(req -> {
                    if (req.getStatus() != RequestStatus.ISSUED_BY_ADMIN) {
                        return new VerificationResponseDto(false, "Certificate request is currently " + req.getStatus().name() + " and not officially issued.");
                    }

                    VerificationResponseDto resp = new VerificationResponseDto(true, "VERIFIED AUTHENTIC CERTIFICATE");
                    resp.setCertificateNumber(req.getCertificateNumber());
                    resp.setCertificateTitle(req.getCertificateType().getTitle());
                    resp.setStudentName(req.getStudent().getName());
                    resp.setStudentRollNo(req.getStudent().getUsername());
                    resp.setDepartment(req.getStudent().getDepartment());
                    resp.setAcademicYear(req.getStudent().getAcademicYear());
                    resp.setPurpose(req.getPurpose());
                    resp.setIssuedAt(req.getIssuedAt());
                    return resp;
                })
                .orElse(new VerificationResponseDto(false, "Invalid Certificate Number or QR hash. Document not found in institutional database."));
    }

    public CertificateRequest getRequestById(Long id) {
        return certificateRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    private String generateHash(String rawInput) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawInput.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}
