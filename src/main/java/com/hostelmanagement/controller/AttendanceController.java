package com.hostelmanagement.controller;

import com.hostelmanagement.dto.Requests.AttendanceSummary;
import com.hostelmanagement.service.StudentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AttendanceController {
    private final StudentService studentService;

    public AttendanceController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/attendance/summary/{studentId}")
    public AttendanceSummary summary(@PathVariable Long studentId) {
        return studentService.attendanceSummary(studentId);
    }
}
