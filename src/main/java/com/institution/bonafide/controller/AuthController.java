package com.institution.bonafide.controller;

import com.institution.bonafide.dto.*;
import com.institution.bonafide.entity.User;
import com.institution.bonafide.entity.enums.Role;
import com.institution.bonafide.repository.UserRepository;
import com.institution.bonafide.security.JwtUtils;
import com.institution.bonafide.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "User does not exist"));
        }

        User user = userOpt.get();
        if (!encoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid username or password"));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getDepartment(),
                userDetails.getAcademicYear(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername()) || userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "User already exists"));
        }

        Role userRole = Role.ROLE_STUDENT;
        if (signUpRequest.getRole() != null) {
            if ("HOD".equalsIgnoreCase(signUpRequest.getRole())) {
                userRole = Role.ROLE_HOD;
            } else if ("ADMIN".equalsIgnoreCase(signUpRequest.getRole())) {
                userRole = Role.ROLE_ADMIN;
            }
        }

        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getDepartment(),
                signUpRequest.getAcademicYear(),
                userRole
        );

        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse(true, "User registered successfully!"));
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody RequestOtpDto request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "No account found with this registered email address."));
        }

        User user = userOpt.get();
        String generatedOtp = String.format("%06d", new SecureRandom().nextInt(900000) + 100000);
        user.setResetOtp(generatedOtp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // System output / Dev response with OTP
        System.out.println("=================================================");
        System.out.println("OTP FOR " + user.getEmail() + " IS: " + generatedOtp);
        System.out.println("=================================================");

        return ResponseEntity.ok(new ApiResponse(true, "OTP sent to " + user.getEmail() + ". Enter OTP: " + generatedOtp));
    }

    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<?> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpDto request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid registered email address."));
        }

        User user = userOpt.get();
        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid OTP entered. Please check and try again."));
        }

        if (user.getResetOtpExpiry() == null || LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "OTP has expired. Please request a new OTP."));
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully! You can now log in with your new password."));
    }
}
