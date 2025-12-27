package com.example.Student.controller;

import com.example.Student.model.Attendance;
import com.example.Student.model.Student;
import com.example.Student.repository.AttendanceRepository;
import com.example.Student.repository.StudentRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceController(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    // Get attendance for a specific date (for Admin view)
    @GetMapping
    public List<Attendance> getAttendanceByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    // Save attendance for a date
    @PostMapping
    public ResponseEntity<?> saveAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody Map<Integer, String> attendanceMap) {
        
        // Fetch existing records for this date to update them, or create new ones
        List<Attendance> existingRecords = attendanceRepository.findByDate(date);
        Map<Integer, Attendance> existingMap = existingRecords.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        List<Attendance> toSave = new ArrayList<>();

        attendanceMap.forEach((studentId, status) -> {
            Attendance record = existingMap.get(studentId);
            if (record == null) {
                // Create new
                studentRepository.findById(studentId).ifPresent(student -> {
                    Attendance newRecord = new Attendance(student, date, status);
                    toSave.add(newRecord);
                });
            } else {
                // Update existing
                record.setStatus(status);
                toSave.add(record);
            }
        });

        attendanceRepository.saveAll(toSave);
        return ResponseEntity.ok().build();
    }

    // Get attendance for a specific student (for Student view)
    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentAttendance(@PathVariable Integer studentId) {
        return attendanceRepository.findByStudent_Id(studentId);
    }
}
