package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.Requests.TextRequest;
import com.hostelmanagement.model.Application;
import com.hostelmanagement.model.Attendance;
import com.hostelmanagement.model.Bill;
import com.hostelmanagement.model.Complaint;
import com.hostelmanagement.model.LeaveRequest;
import com.hostelmanagement.model.Payment;
import com.hostelmanagement.service.StudentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student/{studentId}")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/applications")
    public Application apply(@PathVariable Long studentId) {
        return studentService.apply(studentId);
    }

    @GetMapping("/applications")
    public List<Application> applications(@PathVariable Long studentId) {
        return studentService.applications(studentId);
    }

    @PostMapping("/leave-requests")
    public LeaveRequest requestLeave(@PathVariable Long studentId, @RequestBody TextRequest request) {
        return studentService.requestLeave(studentId, request.value());
    }

    @GetMapping("/leave-requests")
    public List<LeaveRequest> leaveRequests(@PathVariable Long studentId) {
        return studentService.leaveRequests(studentId);
    }

    @PostMapping("/complaints")
    public Complaint complaint(@PathVariable Long studentId, @RequestBody TextRequest request) {
        return studentService.raiseComplaint(studentId, request.value());
    }

    @GetMapping("/complaints")
    public List<Complaint> complaints(@PathVariable Long studentId) {
        return studentService.complaints(studentId);
    }

    @GetMapping("/attendance")
    public List<Attendance> attendance(@PathVariable Long studentId) {
        return studentService.attendance(studentId);
    }

    @GetMapping("/bills")
    public List<Bill> bills(@PathVariable Long studentId) {
        return studentService.bills(studentId);
    }

    @PostMapping("/bills/{billId}/pay")
    public Payment pay(@PathVariable Long studentId, @PathVariable Long billId) {
        return studentService.payBill(studentId, billId);
    }

    @GetMapping("/payments")
    public List<Payment> payments(@PathVariable Long studentId) {
        return studentService.payments(studentId);
    }

    @GetMapping("/profile")
    public ApiResponse profile() {
        return new ApiResponse("Profile is available from the active login session");
    }
}
