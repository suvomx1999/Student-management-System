package com.example.Student.service;

import com.example.Student.model.Teacher;
import java.util.List;
import java.util.Optional;

public interface TeacherService {
    Teacher createTeacher(Teacher teacher);
    List<Teacher> getAllTeachers();
    Optional<Teacher> getTeacherById(Integer id);
    Teacher updateTeacher(Integer id, Teacher teacher);
    void deleteTeacher(Integer id);
}
