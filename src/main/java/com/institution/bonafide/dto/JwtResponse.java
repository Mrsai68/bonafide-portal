package com.institution.bonafide.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String name;
    private String email;
    private String department;
    private String academicYear;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, String name, String email, String department, String academicYear, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.department = department;
        this.academicYear = academicYear;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getDepartment() { return department; }
    public String getAcademicYear() { return academicYear; }
    public List<String> getRoles() { return roles; }
}
