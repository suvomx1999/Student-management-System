package com.example.Student.service;

import com.example.Student.model.Student;
import java.util.List;
import java.util.Optional;

public interface StudentService {
    Student createStudent(Student student);
    List<Student> getAllStudents();
    Optional<Student> getStudentById(Integer id);
    Student updateStudent(Integer id, Student student);
    void deleteStudent(Integer id);
}
