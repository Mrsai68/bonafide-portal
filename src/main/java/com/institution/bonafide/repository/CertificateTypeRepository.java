package com.institution.bonafide.repository;

import com.institution.bonafide.entity.CertificateType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateTypeRepository extends JpaRepository<CertificateType, Long> {
    Optional<CertificateType> findByTitle(String title);
}
