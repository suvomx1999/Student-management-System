package com.example.Student.service.impl;

import com.example.Student.model.Student;
import com.example.Student.repository.StudentRepository;
import com.example.Student.service.StudentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repo;

    public StudentServiceImpl(StudentRepository repo) {
        this.repo = repo;
    }

    @Override
    public Student createStudent(Student student) {
        return repo.save(student);
    }

    @Override
    public List<Student> getAllStudents() {
        return repo.findAll();
    }

    @Override
    public Optional<Student> getStudentById(Integer id) {
        return repo.findById(id);
    }

    @Override
    public Student updateStudent(Integer id, Student student) {
        return repo.findById(id).map(existing -> {
            existing.setName(student.getName());
            existing.setDepartment(student.getDepartment());
            existing.setEmail(student.getEmail());
            if (student.getCgpa() != null) {
                existing.setCgpa(student.getCgpa());
            }
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Student not found with id " + id));
    }

    @Override
    public void deleteStudent(Integer id) {
        repo.deleteById(id);
    }

    @Override
    public Student updateCgpa(Integer id, Double cgpa) {
        return repo.findById(id).map(existing -> {
            existing.setCgpa(cgpa);
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Student not found with id " + id));
    }
}
