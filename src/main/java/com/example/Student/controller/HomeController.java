package com.example.Student.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        return "Welcome to Student Management API!<br>" +
               "Available endpoints:<br>" +
               "GET /api/students - Get all students<br>" +
               "POST /api/students - Create student<br>" +
               "GET /api/students/{id} - Get student by ID<br>" +
               "PUT /api/students/{id} - Update student<br>" +
               "DELETE /api/students/{id} - Delete student<br>" +
               "<br>Database Console: <a href='/h2-console'>/h2-console</a>";
    }
}
