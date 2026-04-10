package com.hostelmanagement.repository;

import com.hostelmanagement.model.Complaint;
import com.hostelmanagement.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatusNot(ComplaintStatus status);
}
