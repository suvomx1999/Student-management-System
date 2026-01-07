package com.example.Student.controller;

import com.example.Student.model.Fee;
import com.example.Student.service.FeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeController {
    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public List<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    @GetMapping("/student/{studentId}")
    public List<Fee> getStudentFees(@PathVariable Integer studentId) {
        return feeService.getFeesByStudent(studentId);
    }

    @PostMapping("/pay/{feeId}")
    public ResponseEntity<Fee> payFee(@PathVariable Integer feeId) {
        try {
            Fee paidFee = feeService.payFee(feeId);
            return ResponseEntity.ok(paidFee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
