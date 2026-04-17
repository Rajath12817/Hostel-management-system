package com.hostelmanagement.service;

import com.hostelmanagement.model.Allocation;
import com.hostelmanagement.model.Application;
import com.hostelmanagement.model.ApplicationStatus;
import com.hostelmanagement.model.Attendance;
import com.hostelmanagement.model.AttendanceStatus;
import com.hostelmanagement.model.Complaint;
import com.hostelmanagement.model.ComplaintStatus;
import com.hostelmanagement.model.LeaveRequest;
import com.hostelmanagement.model.LeaveStatus;
import com.hostelmanagement.model.Room;
import com.hostelmanagement.model.RoomStatus;
import com.hostelmanagement.model.User;
import com.hostelmanagement.model.UserRole;
import com.hostelmanagement.repository.AllocationRepository;
import com.hostelmanagement.repository.ApplicationRepository;
import com.hostelmanagement.repository.AttendanceRepository;
import com.hostelmanagement.repository.ComplaintRepository;
import com.hostelmanagement.repository.HostelJdbcRepository;
import com.hostelmanagement.repository.LeaveRequestRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

@Service
public class WardenService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final ApplicationRepository applicationRepository;
    private final AllocationRepository allocationRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final HostelJdbcRepository hostelJdbcRepository;

    public WardenService(UserRepository userRepository,
                         RoomRepository roomRepository,
                         ApplicationRepository applicationRepository,
                         AllocationRepository allocationRepository,
                         AttendanceRepository attendanceRepository,
                         LeaveRequestRepository leaveRequestRepository,
                         ComplaintRepository complaintRepository,
                         HostelJdbcRepository hostelJdbcRepository) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.applicationRepository = applicationRepository;
        this.allocationRepository = allocationRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.complaintRepository = complaintRepository;
        this.hostelJdbcRepository = hostelJdbcRepository;
    }

    public List<Application> applications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Application updateApplication(Long id, ApplicationStatus status) {
        Application application = applicationRepository.findById(id).orElseThrow(() -> new NotFoundException("Application not found"));
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    @Transactional
    public Allocation allocateRoom(Long studentId, Long roomId) {
        User student = student(studentId);
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new NotFoundException("Room not found"));
        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new BusinessException("Room is under maintenance");
        }
        if (allocationRepository.findByStudentId(studentId).isPresent()) {
            throw new BusinessException("Student already has a room allocation");
        }
        if (allocationRepository.countByRoomId(roomId) >= room.getCapacity()) {
            room.setStatus(RoomStatus.OCCUPIED);
            roomRepository.save(room);
            throw new BusinessException("Room is full");
        }
        Allocation allocation = new Allocation();
        allocation.setStudent(student);
        allocation.setRoom(room);
        Allocation saved = allocationRepository.save(allocation);
        if (allocationRepository.countByRoomId(roomId) >= room.getCapacity()) {
            room.setStatus(RoomStatus.OCCUPIED);
            roomRepository.save(room);
        }
        return saved;
    }

    public Attendance markAttendance(Long studentId, LocalDate date, AttendanceStatus status) {
        User student = student(studentId);
        if (status == null) {
            throw new BusinessException("Attendance status is required");
        }
        LocalDate attendanceDate = date == null ? LocalDate.now() : date;
        if (attendanceRepository.existsByStudentIdAndAttendanceDate(studentId, attendanceDate)
                || hostelJdbcRepository.attendanceExists(studentId, attendanceDate)) {
            throw new BusinessException("Attendance is already marked for this student on this date");
        }
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setAttendanceDate(attendanceDate);
        attendance.setStatus(status);
        return attendanceRepository.save(attendance);
    }

    public LeaveRequest updateLeave(Long id, LeaveStatus status) {
        LeaveRequest request = leaveRequestRepository.findById(id).orElseThrow(() -> new NotFoundException("Leave request not found"));
        request.setStatus(status);
        return leaveRequestRepository.save(request);
    }

    public Complaint resolveComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new NotFoundException("Complaint not found"));
        complaint.setStatus(ComplaintStatus.RESOLVED);
        return complaintRepository.save(complaint);
    }

    public List<Allocation> allocations() {
        return allocationRepository.findAllByOrderByAllocatedAtDesc();
    }

    public List<Attendance> attendance() {
        return attendanceRepository.findAllByOrderByAttendanceDateDesc();
    }

    public List<Attendance> attendance(LocalDate date) {
        if (date == null) {
            return attendance();
        }
        return attendanceRepository.findByDateForWarden(date);
    }

    public List<LeaveRequest> leaveRequests() {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> complaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<User> students() {
        List<User> approved = userRepository.findApprovedStudents();
        List<User> allocated = allocationRepository.findAllocatedStudents();
        LinkedHashMap<Long, User> merged = new LinkedHashMap<>();
        approved.forEach(user -> merged.put(user.getId(), user));
        allocated.forEach(user -> merged.putIfAbsent(user.getId(), user));
        return new ArrayList<>(merged.values());
    }

    public List<User> approvedStudents() {
        return userRepository.findApprovedStudents();
    }

    public List<User> allocatableStudents() {
        return userRepository.findAllocatableStudents();
    }

    public List<Room> availableRooms() {
        return roomRepository.findByStatusOrderByRoomNumber(RoomStatus.AVAILABLE);
    }

    private User student(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Student not found"));
        if (user.getRole() != UserRole.STUDENT) {
            throw new BusinessException("User is not a student");
        }
        return user;
    }
}
