package com.example.Student.service;

import com.example.Student.model.Subject;

import java.util.List;

public interface SubjectService {
    List<Subject> listAll();
    List<Subject> listByDepartmentName(String departmentName);
    Subject create(String departmentName, String subjectName);
    void delete(Integer id);
}
