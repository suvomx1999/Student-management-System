package com.example.Student.controller;

import com.example.Student.model.Subject;
import com.example.Student.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectService service;

    public SubjectController(SubjectService service) {
        this.service = service;
    }

    @GetMapping
    public List<Subject> list(@RequestParam(required = false) String department) {
        if (department == null || department.isBlank() || department.equalsIgnoreCase("All")) {
            return service.listAll();
        }
        return service.listByDepartmentName(department);
    }

    @PostMapping
    public ResponseEntity<Subject> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String department = body.get("department");
        Subject created = service.create(department, name);
        return ResponseEntity.created(URI.create("/api/subjects/" + created.getId())).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
