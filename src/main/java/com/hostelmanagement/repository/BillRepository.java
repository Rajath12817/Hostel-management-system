package com.hostelmanagement.repository;

import com.hostelmanagement.model.Bill;
import com.hostelmanagement.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Bill> findAllByOrderByCreatedAtDesc();

    long countByStatus(BillStatus status);
}
