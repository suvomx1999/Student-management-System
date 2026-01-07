package com.example.Student.controller;

import com.example.Student.dto.ResultDTO;
import com.example.Student.model.Result;
import com.example.Student.model.Student;
import com.example.Student.model.Subject;
import com.example.Student.repository.ResultRepository;
import com.example.Student.repository.StudentRepository;
import com.example.Student.repository.SubjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public ResultController(ResultRepository resultRepository, StudentRepository studentRepository, SubjectRepository subjectRepository) {
        this.resultRepository = resultRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    @GetMapping("/student/{studentId}")
    public List<Result> getStudentResults(@PathVariable Integer studentId) {
        return resultRepository.findByStudent_Id(studentId);
    }

    @GetMapping("/department/{departmentName}")
    public List<Result> getDepartmentResults(@PathVariable String departmentName) {
        return resultRepository.findBySubject_Department_Name(departmentName);
    }

    @PostMapping
    public ResponseEntity<?> saveResult(@Valid @RequestBody ResultDTO dto) {
        Optional<Student> studentOpt = studentRepository.findById(dto.getStudentId());
        Optional<Subject> subjectOpt = subjectRepository.findById(dto.getSubjectId());

        if (studentOpt.isEmpty() || subjectOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid Student or Subject ID");
        }

        Student student = studentOpt.get();
        Subject subject = subjectOpt.get();

        Optional<Result> existing = resultRepository.findByStudent_IdAndSubject_Id(student.getId(), subject.getId());
        Result result;
        if (existing.isPresent()) {
            result = existing.get();
            result.setMarks(dto.getMarks());
        } else {
            result = new Result(student, subject, dto.getMarks());
        }

        resultRepository.save(result);
        return ResponseEntity.ok(result);
    }
}
