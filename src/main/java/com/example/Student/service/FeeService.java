package com.example.Student.service;

import com.example.Student.model.Fee;
import com.example.Student.model.Student;
import com.example.Student.repository.FeeRepository;
import com.example.Student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class FeeService {
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;

    public FeeService(FeeRepository feeRepository, StudentRepository studentRepository) {
        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
    }

    public List<Fee> getFeesByStudent(Integer studentId) {
        // For demo: if no fees exist for this student, create a dummy one
        List<Fee> fees = feeRepository.findByStudent_Id(studentId);
        if (fees.isEmpty()) {
            Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
            Fee dummyFee = new Fee(student, 50000.0, "Semester 1 Tuition Fee", LocalDate.now().plusDays(30));
            fees.add(feeRepository.save(dummyFee));
        }
        return fees;
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    @Transactional
    public Fee payFee(Integer feeId) {
        Fee fee = feeRepository.findById(feeId).orElseThrow(() -> new RuntimeException("Fee not found"));
        if ("PAID".equals(fee.getStatus())) {
            throw new RuntimeException("Fee already paid");
        }
        fee.setStatus("PAID");
        fee.setPaymentDate(LocalDate.now());
        fee.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return feeRepository.save(fee);
    }
}
