package com.example.Student.service.impl;

import com.example.Student.model.Department;
import com.example.Student.repository.DepartmentRepository;
import com.example.Student.service.DepartmentService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository repo;

    public DepartmentServiceImpl(DepartmentRepository repo) {
        this.repo = repo;
    }

    @Override
    public Optional<Department> findByName(String name) {
        return repo.findByName(name);
    }

    @Override
    public Department getOrCreateByName(String name) {
        return repo.findByName(name).orElseGet(() -> repo.save(new Department(name)));
    }
}
