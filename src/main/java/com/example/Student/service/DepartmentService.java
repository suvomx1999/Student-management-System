package com.example.Student.service;

import com.example.Student.model.Department;

import java.util.Optional;

public interface DepartmentService {
    Optional<Department> findByName(String name);
    Department getOrCreateByName(String name);
}
