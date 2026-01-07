package com.example.Student.repository;

import com.example.Student.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Integer> {
    List<Result> findByStudent_Id(Integer studentId);
    List<Result> findBySubject_Department_Name(String departmentName);
    Optional<Result> findByStudent_IdAndSubject_Id(Integer studentId, Integer subjectId);
    void deleteByStudent_Id(Integer studentId);
    void deleteBySubject_Id(Integer subjectId);
}
