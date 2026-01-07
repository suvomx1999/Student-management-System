package com.example.Student.repository;

import com.example.Student.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Integer> {
    List<Fee> findByStudent_Id(Integer studentId);
}
