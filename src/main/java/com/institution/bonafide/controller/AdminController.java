package com.institution.bonafide.controller;

import com.institution.bonafide.dto.ApiResponse;
import com.institution.bonafide.dto.ApprovalRequestDto;
import com.institution.bonafide.entity.CertificateRequest;
import com.institution.bonafide.entity.User;
import com.institution.bonafide.entity.enums.RequestStatus;
import com.institution.bonafide.entity.enums.Role;
import com.institution.bonafide.repository.CertificateRequestRepository;
import com.institution.bonafide.repository.UserRepository;
import com.institution.bonafide.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private CertificateRequestRepository certificateRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<CertificateRequest>> getPendingAdminIssuance() {
        return ResponseEntity.ok(certificateService.getAdminPendingIssuance());
    }

    @PostMapping("/action/{id}")
    public ResponseEntity<?> processIssuance(@PathVariable Long id, @RequestBody ApprovalRequestDto dto) {
        CertificateRequest req = certificateService.processAdminIssuance(id, dto);
        String actionStr = dto.isApproved() ? "Issued" : "Rejected";
        return ResponseEntity.ok(new ApiResponse(true, "Certificate " + req.getCertificateNumber() + " successfully " + actionStr + " by Central Admin."));
    }

    @GetMapping("/students")
    public ResponseEntity<List<User>> getRegisteredStudents() {
        return ResponseEntity.ok(userRepository.findByRole(Role.ROLE_STUDENT));
    }

    @GetMapping("/issued-history")
    public ResponseEntity<List<CertificateRequest>> getIssuedHistory() {
        return ResponseEntity.ok(certificateRequestRepository.findByStatusOrderByRequestedAtAsc(RequestStatus.ISSUED_BY_ADMIN));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.findByRole(Role.ROLE_STUDENT).size());
        stats.put("totalRequests", certificateRequestRepository.count());
        stats.put("pendingHod", certificateRequestRepository.countByStatus(RequestStatus.PENDING_HOD_APPROVAL));
        stats.put("pendingAdmin", certificateRequestRepository.countByStatus(RequestStatus.APPROVED_BY_HOD));
        stats.put("totalIssued", certificateRequestRepository.countByStatus(RequestStatus.ISSUED_BY_ADMIN));
        stats.put("totalRejected", certificateRequestRepository.countByStatus(RequestStatus.REJECTED_BY_HOD) + certificateRequestRepository.countByStatus(RequestStatus.REJECTED_BY_ADMIN));
        return ResponseEntity.ok(stats);
    }
}
