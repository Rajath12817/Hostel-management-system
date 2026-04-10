package com.hostelmanagement.controller;

import com.hostelmanagement.dto.Requests.AllocationRequest;
import com.hostelmanagement.dto.Requests.AttendanceRequest;
import com.hostelmanagement.model.Allocation;
import com.hostelmanagement.model.Application;
import com.hostelmanagement.model.ApplicationStatus;
import com.hostelmanagement.model.Attendance;
import com.hostelmanagement.model.AttendanceStatus;
import com.hostelmanagement.model.Complaint;
import com.hostelmanagement.model.LeaveRequest;
import com.hostelmanagement.model.LeaveStatus;
import com.hostelmanagement.model.Room;
import com.hostelmanagement.model.User;
import com.hostelmanagement.service.WardenService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/warden")
public class WardenController {
    private final WardenService wardenService;

    public WardenController(WardenService wardenService) {
        this.wardenService = wardenService;
    }

    @GetMapping("/applications")
    public List<Application> applications() {
        return wardenService.applications();
    }

    @PutMapping("/applications/{id}/approve")
    public Application approveApplication(@PathVariable Long id) {
        return wardenService.updateApplication(id, ApplicationStatus.APPROVED);
    }

    @PutMapping("/applications/{id}/reject")
    public Application rejectApplication(@PathVariable Long id) {
        return wardenService.updateApplication(id, ApplicationStatus.REJECTED);
    }

    @PostMapping("/allocations")
    public Allocation allocate(@RequestBody AllocationRequest request) {
        return wardenService.allocateRoom(request.studentId(), request.roomId());
    }

    @GetMapping("/allocations")
    public List<Allocation> allocations() {
        return wardenService.allocations();
    }

    @PostMapping("/attendance")
    public Attendance attendance(@RequestBody AttendanceRequest request) {
        return wardenService.markAttendance(request.studentId(), request.date(), AttendanceStatus.valueOf(request.status()));
    }

    @GetMapping("/attendance")
    public List<Attendance> attendance() {
        return wardenService.attendance();
    }

    @GetMapping("/leave-requests")
    public List<LeaveRequest> leaveRequests() {
        return wardenService.leaveRequests();
    }

    @PutMapping("/leave-requests/{id}/approve")
    public LeaveRequest approveLeave(@PathVariable Long id) {
        return wardenService.updateLeave(id, LeaveStatus.APPROVED);
    }

    @PutMapping("/leave-requests/{id}/reject")
    public LeaveRequest rejectLeave(@PathVariable Long id) {
        return wardenService.updateLeave(id, LeaveStatus.REJECTED);
    }

    @GetMapping("/complaints")
    public List<Complaint> complaints() {
        return wardenService.complaints();
    }

    @PutMapping("/complaints/{id}/resolve")
    public Complaint resolveComplaint(@PathVariable Long id) {
        return wardenService.resolveComplaint(id);
    }

    @GetMapping("/students")
    public List<User> students() {
        return wardenService.students();
    }

    @GetMapping("/rooms/available")
    public List<Room> availableRooms() {
        return wardenService.availableRooms();
    }
}
