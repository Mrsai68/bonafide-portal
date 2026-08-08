package com.institution.bonafide.config;

import com.institution.bonafide.entity.CertificateType;
import com.institution.bonafide.entity.User;
import com.institution.bonafide.entity.enums.Role;
import com.institution.bonafide.repository.CertificateTypeRepository;
import com.institution.bonafide.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CertificateTypeRepository certificateTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Certificate Types
        if (certificateTypeRepository.count() == 0) {
            certificateTypeRepository.save(new CertificateType("Bonafide Certificate", "", true));
            certificateTypeRepository.save(new CertificateType("Internship NOC", "", true));
            certificateTypeRepository.save(new CertificateType("Character & Conduct Certificate", "", true));
            certificateTypeRepository.save(new CertificateType("Fee Structure Certificate", "", false));
        }

        // Seed Admin User (Central Office)
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "Central Administration Office", "admin@gpmiraj.ac.in", passwordEncoder.encode("password123"), "Central Office", "N/A", Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        // Seed HOD User (Department Faculty)
        if (!userRepository.existsByUsername("hod_comp")) {
            User hodComp = new User("hod_comp", "Prof. S. R. Kulkarni (HOD)", "hod.comp@gpmiraj.ac.in", passwordEncoder.encode("password123"), "Computer Engineering", "Department Head", Role.ROLE_HOD);
            userRepository.save(hodComp);
        }

        // Seed Demo Student User
        if (!userRepository.existsByUsername("roll101")) {
            User student = new User("roll101", "Aarav Sharma", "aarav.sharma@student.gpmiraj.ac.in", passwordEncoder.encode("password123"), "Computer Engineering", "Third Year Diploma (Computer Engineering)", Role.ROLE_STUDENT);
            userRepository.save(student);
        }
    }
}
