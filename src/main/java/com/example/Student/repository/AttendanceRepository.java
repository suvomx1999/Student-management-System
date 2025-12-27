package com.example.Student.repository;

import com.example.Student.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByStudent_Id(Integer studentId);
    
    List<Attendance> findByStudent_IdAndDateBetween(Integer studentId, LocalDate startDate, LocalDate endDate);
}
