package com.institution.bonafide.controller;

import com.institution.bonafide.dto.ApiResponse;
import com.institution.bonafide.dto.CertificateRequestDto;
import com.institution.bonafide.entity.CertificateRequest;
import com.institution.bonafide.entity.CertificateType;
import com.institution.bonafide.entity.enums.RequestStatus;
import com.institution.bonafide.repository.CertificateTypeRepository;
import com.institution.bonafide.security.UserDetailsImpl;
import com.institution.bonafide.service.CertificateService;
import com.institution.bonafide.service.PdfGeneratorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private CertificateTypeRepository certificateTypeRepository;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @GetMapping("/certificate-types")
    public ResponseEntity<List<CertificateType>> getAvailableTypes() {
        return ResponseEntity.ok(certificateTypeRepository.findAll());
    }

    @PostMapping("/request")
    public ResponseEntity<?> applyCertificate(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                              @Valid @RequestBody CertificateRequestDto dto) {
        CertificateRequest req = certificateService.createRequest(userDetails.getUsername(), dto);
        return ResponseEntity.ok(new ApiResponse(true, "Certificate request submitted successfully. Request ID: " + req.getCertificateNumber()));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<CertificateRequest>> getMyRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(certificateService.getStudentRequests(userDetails.getUsername()));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadCertificatePdf(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                         @PathVariable Long id) {
        CertificateRequest req = certificateService.getRequestById(id);

        if (!req.getStudent().getUsername().equalsIgnoreCase(userDetails.getUsername())) {
            return ResponseEntity.status(403).build();
        }

        if (req.getStatus() != RequestStatus.ISSUED_BY_ADMIN) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] pdfBytes = pdfGeneratorService.generateCertificatePdf(req);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", req.getCertificateNumber() + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
