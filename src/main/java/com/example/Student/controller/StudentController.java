package com.example.Student.controller;

import com.example.Student.dto.StudentDTO;
import com.example.Student.model.Department;
import com.example.Student.model.Student;
import com.example.Student.service.DepartmentService;
import com.example.Student.service.StudentService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;
    private final DepartmentService departmentService;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentService service, DepartmentService departmentService, PasswordEncoder passwordEncoder) {
        this.service = service;
        this.departmentService = departmentService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody StudentDTO dto) {
        Department dept = dto.getDepartment() != null && !dto.getDepartment().isBlank()
                ? departmentService.getOrCreateByName(dto.getDepartment())
                : null;
        Student toCreate = new Student();
        toCreate.setName(dto.getName());
        toCreate.setEmail(dto.getEmail());
        // Default password if not provided
        String rawPassword = dto.getPassword() != null ? dto.getPassword() : "password";
        toCreate.setPassword(passwordEncoder.encode(rawPassword));
        toCreate.setCgpa(dto.getCgpa());
        toCreate.setDepartment(dept);
        Student created = service.createStudent(toCreate);
        return ResponseEntity.created(URI.create("/api/students/" + created.getId())).body(created);
    }

    @GetMapping
    public List<Student> getAllStudents(@RequestParam(required = false) String department) {
        if (department != null && !department.isBlank()) {
            return service.getStudentsByDepartment(department);
        }
        return service.getAllStudents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Integer id) {
        return service.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Integer id, @Valid @RequestBody StudentDTO dto) {
        Department dept = dto.getDepartment() != null && !dto.getDepartment().isBlank()
                ? departmentService.getOrCreateByName(dto.getDepartment())
                : null;
        Student toUpdate = new Student();
        toUpdate.setName(dto.getName());
        toUpdate.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            toUpdate.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        toUpdate.setDepartment(dept);
        try {
            Student updated = service.updateStudent(id, toUpdate);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer id) {
        service.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cgpa")
    public ResponseEntity<Student> updateCgpa(@PathVariable Integer id, @RequestBody Map<String, Double> payload) {
        Double cgpa = payload.get("cgpa");
        try {
            Student updated = service.updateCgpa(id, cgpa);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
