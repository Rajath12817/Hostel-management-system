package com.hostelmanagement.service;

import com.hostelmanagement.model.Bill;
import com.hostelmanagement.model.BillStatus;
import com.hostelmanagement.model.ComplaintStatus;
import com.hostelmanagement.model.Room;
import com.hostelmanagement.model.RoomStatus;
import com.hostelmanagement.model.User;
import com.hostelmanagement.model.UserRole;
import com.hostelmanagement.repository.ApplicationRepository;
import com.hostelmanagement.repository.BillRepository;
import com.hostelmanagement.repository.ComplaintRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final ApplicationRepository applicationRepository;
    private final ComplaintRepository complaintRepository;

    public AdminService(RoomRepository roomRepository,
                        UserRepository userRepository,
                        BillRepository billRepository,
                        PaymentRepository paymentRepository,
                        ApplicationRepository applicationRepository,
                        ComplaintRepository complaintRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.applicationRepository = applicationRepository;
        this.complaintRepository = complaintRepository;
    }

    public Room createRoom(String roomNumber, int capacity, RoomStatus status) {
        requireRoom(roomNumber, capacity);
        if (roomRepository.findByRoomNumber(roomNumber.trim()).isPresent()) {
            throw new BusinessException("Room number already exists");
        }
        Room room = new Room();
        room.setRoomNumber(roomNumber.trim());
        room.setCapacity(capacity);
        room.setStatus(status == null ? RoomStatus.AVAILABLE : status);
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, String roomNumber, int capacity, RoomStatus status) {
        requireRoom(roomNumber, capacity);
        Room room = roomRepository.findById(id).orElseThrow(() -> new NotFoundException("Room not found"));
        room.setRoomNumber(roomNumber.trim());
        room.setCapacity(capacity);
        room.setStatus(status == null ? RoomStatus.AVAILABLE : status);
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new NotFoundException("Room not found");
        }
        roomRepository.deleteById(id);
    }

    public Bill generateBill(Long studentId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Bill amount must be positive");
        }
        User student = userRepository.findById(studentId).orElseThrow(() -> new NotFoundException("Student not found"));
        if (student.getRole() != UserRole.STUDENT) {
            throw new BusinessException("Bills can only be generated for students");
        }
        Bill bill = new Bill();
        bill.setStudent(student);
        bill.setAmount(amount);
        return billRepository.save(bill);
    }

    public List<Room> rooms() {
        return roomRepository.findAll();
    }

    public List<Bill> bills() {
        return billRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<User> students() {
        return userRepository.findByRoleOrderByName(UserRole.STUDENT);
    }

    public Map<String, Long> reports() {
        Map<String, Long> report = new LinkedHashMap<>();
        report.put("Students", (long) userRepository.findByRoleOrderByName(UserRole.STUDENT).size());
        report.put("Rooms", roomRepository.count());
        report.put("Applications", applicationRepository.count());
        report.put("Open Complaints", complaintRepository.countByStatusNot(ComplaintStatus.RESOLVED));
        report.put("Unpaid Bills", billRepository.countByStatus(BillStatus.UNPAID));
        report.put("Payments", paymentRepository.count());
        return report;
    }

    private void requireRoom(String roomNumber, int capacity) {
        if (roomNumber == null || roomNumber.trim().isEmpty()) {
            throw new BusinessException("Room number is required");
        }
        if (capacity <= 0) {
            throw new BusinessException("Capacity must be positive");
        }
    }
}
