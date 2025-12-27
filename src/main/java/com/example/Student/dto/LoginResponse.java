package com.example.Student.dto;

public class LoginResponse {
    private Integer id;
    private String name;
    private String role; // "ADMIN" or "STUDENT"
    private String token; // For future use

    public LoginResponse(Integer id, String name, String role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getRole() { return role; }
}
