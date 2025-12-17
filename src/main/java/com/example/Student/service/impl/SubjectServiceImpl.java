package com.example.Student.service.impl;

import com.example.Student.model.Department;
import com.example.Student.model.Subject;
import com.example.Student.repository.SubjectRepository;
import com.example.Student.service.DepartmentService;
import com.example.Student.service.SubjectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository repo;
    private final DepartmentService departmentService;

    public SubjectServiceImpl(SubjectRepository repo, DepartmentService departmentService) {
        this.repo = repo;
        this.departmentService = departmentService;
    }

    @Override
    public List<Subject> listByDepartmentName(String departmentName) {
        return repo.findByDepartment_Name(departmentName);
    }

    @Override
    public Subject create(String departmentName, String subjectName) {
        Department dept = departmentName != null && !departmentName.isBlank()
                ? departmentService.getOrCreateByName(departmentName)
                : null;
        Subject s = new Subject(subjectName, dept);
        return repo.save(s);
    }

    @Override
    public void delete(Integer id) {
        repo.deleteById(id);
    }
}
