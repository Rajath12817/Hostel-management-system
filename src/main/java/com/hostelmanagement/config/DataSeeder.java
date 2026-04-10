package com.hostelmanagement.config;

import com.hostelmanagement.model.Bill;
import com.hostelmanagement.model.Room;
import com.hostelmanagement.model.RoomStatus;
import com.hostelmanagement.model.User;
import com.hostelmanagement.model.UserFactory;
import com.hostelmanagement.repository.BillRepository;
import com.hostelmanagement.repository.RoomRepository;
import com.hostelmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BillRepository billRepository;

    public DataSeeder(UserRepository userRepository, RoomRepository roomRepository, BillRepository billRepository) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.billRepository = billRepository;
    }

    @Override
    public void run(String... args) {
        User student = createUserIfMissing("STUDENT", "Rajat Student", "student@hostel.com", "student123");
        createUserIfMissing("WARDEN", "Main Warden", "warden@hostel.com", "warden123");
        createUserIfMissing("ADMIN", "System Admin", "admin@hostel.com", "admin123");

        createRoomIfMissing("101", 2, RoomStatus.AVAILABLE);
        createRoomIfMissing("102", 3, RoomStatus.AVAILABLE);
        createRoomIfMissing("103", 2, RoomStatus.MAINTENANCE);

        if (billRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).isEmpty()) {
            Bill bill = new Bill();
            bill.setStudent(student);
            bill.setAmount(new BigDecimal("12000.00"));
            billRepository.save(bill);
        }
    }

    private User createUserIfMissing(String role, String name, String email, String password) {
        return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User user = UserFactory.createUser(role);
            user.setName(name);
            user.setEmail(email);
            user.setPassword(password);
            return userRepository.save(user);
        });
    }

    private void createRoomIfMissing(String number, int capacity, RoomStatus status) {
        roomRepository.findByRoomNumber(number).orElseGet(() -> {
            Room room = new Room();
            room.setRoomNumber(number);
            room.setCapacity(capacity);
            room.setStatus(status);
            return roomRepository.save(room);
        });
    }
}
