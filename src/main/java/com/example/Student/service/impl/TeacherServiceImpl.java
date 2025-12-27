package com.example.Student.service.impl;

import com.example.Student.model.Teacher;
import com.example.Student.repository.TeacherRepository;
import com.example.Student.service.TeacherService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository repo;

    public TeacherServiceImpl(TeacherRepository repo) {
        this.repo = repo;
    }

    @Override
    public Teacher createTeacher(Teacher teacher) {
        return repo.save(teacher);
    }

    @Override
    public List<Teacher> getAllTeachers() {
        return repo.findAll();
    }

    @Override
    public Optional<Teacher> getTeacherById(Integer id) {
        return repo.findById(id);
    }

    @Override
    public Teacher updateTeacher(Integer id, Teacher teacher) {
        return repo.findById(id).map(existing -> {
            existing.setName(teacher.getName());
            existing.setDepartment(teacher.getDepartment());
            existing.setEmail(teacher.getEmail());
            existing.setDesignation(teacher.getDesignation());
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Teacher not found with id " + id));
    }

    @Override
    public void deleteTeacher(Integer id) {
        repo.deleteById(id);
    }
}
