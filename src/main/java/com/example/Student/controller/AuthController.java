package com.example.Student.controller;

import com.example.Student.dto.LoginRequest;
import com.example.Student.dto.LoginResponse;
import com.example.Student.model.Student;
import com.example.Student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Hardcoded Admin Check
        if ("Shubashis".equals(request.getEmail()) && "suvo1234".equals(request.getPassword())) {
            return ResponseEntity.ok(new LoginResponse(0, "Admin", "ADMIN"));
        }

        // Student Check
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            // In a real app, use BCrypt. Here we do simple check.
            // If password is null (legacy users), we might want to allow them to set it or default to something.
            // For now, let's assume if db password is null, they can't login, OR we check against a default.
            String dbPass = student.getPassword();
            
            // Check if password matches (if dbPass is null, this fails unless we allow a default)
            if (dbPass != null && dbPass.equals(request.getPassword())) {
                return ResponseEntity.ok(new LoginResponse(student.getId(), student.getName(), "STUDENT"));
            }
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
