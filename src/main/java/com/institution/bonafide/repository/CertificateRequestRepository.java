package com.institution.bonafide.repository;

import com.institution.bonafide.entity.CertificateRequest;
import com.institution.bonafide.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {
    List<CertificateRequest> findByStudentIdOrderByRequestedAtDesc(Long studentId);
    List<CertificateRequest> findByStudentDepartmentAndStatus(String department, RequestStatus status);
    List<CertificateRequest> findByStudentDepartmentAndStatusInOrderByRequestedAtDesc(String department, List<RequestStatus> statuses);
    List<CertificateRequest> findByStatusOrderByRequestedAtAsc(RequestStatus status);
    Optional<CertificateRequest> findByCertificateNumber(String certificateNumber);
    Optional<CertificateRequest> findByQrVerificationHash(String qrVerificationHash);
    long countByStatus(RequestStatus status);
}
