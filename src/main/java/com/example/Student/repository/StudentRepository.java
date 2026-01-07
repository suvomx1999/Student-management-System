package com.example.Student.repository;

import com.example.Student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    java.util.Optional<Student> findByEmail(String email);
    java.util.List<Student> findByDepartment_Name(String departmentName);
}
