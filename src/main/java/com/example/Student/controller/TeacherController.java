package com.example.Student.controller;

import com.example.Student.dto.TeacherDTO;
import com.example.Student.model.Department;
import com.example.Student.model.Teacher;
import com.example.Student.service.DepartmentService;
import com.example.Student.service.TeacherService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService service;
    private final DepartmentService departmentService;
    private final PasswordEncoder passwordEncoder;

    public TeacherController(TeacherService service, DepartmentService departmentService, PasswordEncoder passwordEncoder) {
        this.service = service;
        this.departmentService = departmentService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<Teacher> createTeacher(@Valid @RequestBody TeacherDTO dto) {
        Department dept = dto.getDepartment() != null && !dto.getDepartment().isBlank()
                ? departmentService.getOrCreateByName(dto.getDepartment())
                : null;
        Teacher toCreate = new Teacher();
        toCreate.setName(dto.getName());
        toCreate.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            toCreate.setPassword(passwordEncoder.encode(dto.getPassword()));
        } else {
            // Default password for teachers if none provided
            toCreate.setPassword(passwordEncoder.encode("password"));
        }
        toCreate.setDesignation(dto.getDesignation());
        toCreate.setDepartment(dept);
        Teacher created = service.createTeacher(toCreate);
        return ResponseEntity.created(URI.create("/api/teachers/" + created.getId())).body(created);
    }

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return service.getAllTeachers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Integer id) {
        return service.getTeacherById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Integer id, @Valid @RequestBody TeacherDTO dto) {
        Department dept = dto.getDepartment() != null && !dto.getDepartment().isBlank()
                ? departmentService.getOrCreateByName(dto.getDepartment())
                : null;
        Teacher toUpdate = new Teacher();
        toUpdate.setName(dto.getName());
        toUpdate.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            toUpdate.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        toUpdate.setDesignation(dto.getDesignation());
        toUpdate.setDepartment(dept);
        try {
            Teacher updated = service.updateTeacher(id, toUpdate);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Integer id) {
        service.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
