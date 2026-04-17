package com.hostelmanagement.service;

import com.hostelmanagement.model.Application;
import com.hostelmanagement.model.Attendance;
import com.hostelmanagement.model.Bill;
import com.hostelmanagement.model.BillStatus;
import com.hostelmanagement.model.Complaint;
import com.hostelmanagement.model.LeaveRequest;
import com.hostelmanagement.model.Payment;
import com.hostelmanagement.model.User;
import com.hostelmanagement.model.UserRole;
import com.hostelmanagement.model.AttendanceStatus;
import com.hostelmanagement.dto.Requests.AttendanceSummary;
import com.hostelmanagement.repository.ApplicationRepository;
import com.hostelmanagement.repository.AttendanceRepository;
import com.hostelmanagement.repository.BillRepository;
import com.hostelmanagement.repository.ComplaintRepository;
import com.hostelmanagement.repository.HostelJdbcRepository;
import com.hostelmanagement.repository.LeaveRequestRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class StudentService {
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final HostelJdbcRepository hostelJdbcRepository;

    public StudentService(UserRepository userRepository,
                          ApplicationRepository applicationRepository,
                          AttendanceRepository attendanceRepository,
                          LeaveRequestRepository leaveRequestRepository,
                          ComplaintRepository complaintRepository,
                          BillRepository billRepository,
                          PaymentRepository paymentRepository,
                          HostelJdbcRepository hostelJdbcRepository) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.complaintRepository = complaintRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.hostelJdbcRepository = hostelJdbcRepository;
    }

    public Application apply(Long studentId) {
        User student = student(studentId);
        if (applicationRepository.existsByStudentId(studentId) || hostelJdbcRepository.applicationExists(studentId)) {
            throw new BusinessException("You have already applied");
        }
        Application application = new Application();
        application.setStudent(student);
        return applicationRepository.save(application);
    }

    public LeaveRequest requestLeave(Long studentId, String reason, LocalDate startDate, LocalDate endDate) {
        requireText(reason, "Leave reason is required");
        if (startDate == null || endDate == null) {
            throw new BusinessException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new BusinessException("End date cannot be before start date");
        }
        LeaveRequest request = new LeaveRequest();
        request.setStudent(student(studentId));
        request.setReason(reason.trim());
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setTotalDays((int) ChronoUnit.DAYS.between(startDate, endDate) + 1);
        return leaveRequestRepository.save(request);
    }

    public Complaint raiseComplaint(Long studentId, String description) {
        requireText(description, "Complaint description is required");
        Complaint complaint = new Complaint();
        complaint.setStudent(student(studentId));
        complaint.setDescription(description.trim());
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Payment payBill(Long studentId, Long billId) {
        User student = student(studentId);
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new NotFoundException("Bill not found"));
        if (!bill.getStudent().getId().equals(studentId)) {
            throw new BusinessException("This bill does not belong to the selected student");
        }
        if (bill.getStatus() == BillStatus.PAID) {
            throw new BusinessException("Bill is already paid");
        }
        bill.setStatus(BillStatus.PAID);
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setBill(bill);
        payment.setAmount(bill.getAmount());
        billRepository.save(bill);
        return paymentRepository.save(payment);
    }

    public List<Application> applications(Long studentId) {
        return applicationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Attendance> attendance(Long studentId) {
        return attendanceRepository.findByStudentIdOrderByAttendanceDateDesc(studentId);
    }

    public AttendanceSummary attendanceSummary(Long studentId) {
        List<Attendance> records = attendance(studentId);
        long presentDays = records.stream().filter(record -> record.getStatus() == AttendanceStatus.PRESENT).count();
        long absentDays = records.stream().filter(record -> record.getStatus() == AttendanceStatus.ABSENT).count();
        long totalDays = records.size();
        double percentage = totalDays == 0 ? 0 : Math.round((presentDays * 10000.0 / totalDays)) / 100.0;
        return new AttendanceSummary(totalDays, presentDays, absentDays, percentage);
    }

    public List<LeaveRequest> leaveRequests(Long studentId) {
        return leaveRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Complaint> complaints(Long studentId) {
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Bill> bills(Long studentId) {
        return billRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Payment> payments(Long studentId) {
        return paymentRepository.findByStudentIdOrderByPaidAtDesc(studentId);
    }

    private User student(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Student not found"));
        if (user.getRole() != UserRole.STUDENT) {
            throw new BusinessException("User is not a student");
        }
        return user;
    }

    private void requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new BusinessException(message);
        }
    }
}
