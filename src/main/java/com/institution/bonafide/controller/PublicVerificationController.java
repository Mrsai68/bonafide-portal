package com.institution.bonafide.controller;

import com.institution.bonafide.dto.VerificationResponseDto;
import com.institution.bonafide.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
public class PublicVerificationController {

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/verify/{certNo}")
    public ResponseEntity<VerificationResponseDto> verifyCertificate(@PathVariable String certNo) {
        return ResponseEntity.ok(certificateService.verifyCertificate(certNo));
    }
}
