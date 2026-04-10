package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.Requests.BillRequest;
import com.hostelmanagement.dto.Requests.RoomRequest;
import com.hostelmanagement.model.Bill;
import com.hostelmanagement.model.Room;
import com.hostelmanagement.model.RoomStatus;
import com.hostelmanagement.model.User;
import com.hostelmanagement.service.AdminService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/rooms")
    public List<Room> rooms() {
        return adminService.rooms();
    }

    @PostMapping("/rooms")
    public Room createRoom(@RequestBody RoomRequest request) {
        return adminService.createRoom(request.roomNumber(), request.capacity(), RoomStatus.valueOf(request.status()));
    }

    @PutMapping("/rooms/{id}")
    public Room updateRoom(@PathVariable Long id, @RequestBody RoomRequest request) {
        return adminService.updateRoom(id, request.roomNumber(), request.capacity(), RoomStatus.valueOf(request.status()));
    }

    @DeleteMapping("/rooms/{id}")
    public ApiResponse deleteRoom(@PathVariable Long id) {
        adminService.deleteRoom(id);
        return new ApiResponse("Room deleted");
    }

    @PostMapping("/bills")
    public Bill generateBill(@RequestBody BillRequest request) {
        return adminService.generateBill(request.studentId(), request.amount());
    }

    @GetMapping("/bills")
    public List<Bill> bills() {
        return adminService.bills();
    }

    @GetMapping("/students")
    public List<User> students() {
        return adminService.students();
    }

    @GetMapping("/reports")
    public Map<String, Long> reports() {
        return adminService.reports();
    }
}
