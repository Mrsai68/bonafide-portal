package com.institution.bonafide.controller;

import com.institution.bonafide.dto.ApiResponse;
import com.institution.bonafide.dto.ApprovalRequestDto;
import com.institution.bonafide.entity.CertificateRequest;
import com.institution.bonafide.entity.User;
import com.institution.bonafide.entity.enums.RequestStatus;
import com.institution.bonafide.entity.enums.Role;
import com.institution.bonafide.repository.CertificateRequestRepository;
import com.institution.bonafide.repository.UserRepository;
import com.institution.bonafide.security.UserDetailsImpl;
import com.institution.bonafide.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/hod")
public class HodController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CertificateRequestRepository certificateRequestRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<CertificateRequest>> getPendingDepartmentRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(certificateService.getHodPendingRequests(userDetails.getUsername()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<User>> getDepartmentStudents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User hod = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("HOD not found"));
        return ResponseEntity.ok(userRepository.findByDepartmentAndRole(hod.getDepartment(), Role.ROLE_STUDENT));
    }

    @GetMapping("/approved-history")
    public ResponseEntity<List<CertificateRequest>> getDepartmentApprovedHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User hod = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("HOD not found"));
        List<RequestStatus> approvedStatuses = List.of(RequestStatus.APPROVED_BY_HOD, RequestStatus.ISSUED_BY_ADMIN);
        return ResponseEntity.ok(certificateRequestRepository.findByStudentDepartmentAndStatusInOrderByRequestedAtDesc(hod.getDepartment(), approvedStatuses));
    }

    @PostMapping("/action/{id}")
    public ResponseEntity<?> processApproval(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @PathVariable Long id,
                                             @RequestBody ApprovalRequestDto dto) {
        CertificateRequest req = certificateService.processHodApproval(id, userDetails.getUsername(), dto);
        String actionStr = dto.isApproved() ? "Approved" : "Rejected";
        return ResponseEntity.ok(new ApiResponse(true, "Request " + req.getCertificateNumber() + " " + actionStr + " by HOD successfully."));
    }
}
