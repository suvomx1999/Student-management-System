package com.example.Student.controller;

import com.example.Student.dto.LoginRequest;
import com.example.Student.dto.LoginResponse;
import com.example.Student.model.Student;
import com.example.Student.model.Teacher;
import com.example.Student.repository.StudentRepository;
import com.example.Student.repository.TeacherRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Hardcoded Admin Check
        if ("Admin".equals(request.getEmail()) && "admin1234".equals(request.getPassword())) {
            return ResponseEntity.ok(new LoginResponse(0, "Admin", "ADMIN"));
        }

        // Student Check
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            String dbPass = student.getPassword();
            // Check for plain text (migration) OR hashed password
            if (dbPass != null && (dbPass.equals(request.getPassword()) || passwordEncoder.matches(request.getPassword(), dbPass))) {
                // Ideally, if it was plain text, we should hash and save it now.
                if (dbPass.equals(request.getPassword())) {
                     student.setPassword(passwordEncoder.encode(request.getPassword()));
                     studentRepository.save(student);
                }
                return ResponseEntity.ok(new LoginResponse(student.getId(), student.getName(), "STUDENT"));
            }
        }

        // Teacher Check
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(request.getEmail());
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            String dbPass = teacher.getPassword();
            if (dbPass != null && (dbPass.equals(request.getPassword()) || passwordEncoder.matches(request.getPassword(), dbPass))) {
                 if (dbPass.equals(request.getPassword())) {
                     teacher.setPassword(passwordEncoder.encode(request.getPassword()));
                     teacherRepository.save(teacher);
                }
                return ResponseEntity.ok(new LoginResponse(teacher.getId(), teacher.getName(), "TEACHER"));
            }
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
