package com.hostelmanagement.repository;

import com.hostelmanagement.model.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    Optional<Allocation> findByStudentId(Long studentId);

    long countByRoomId(Long roomId);

    List<Allocation> findAllByOrderByAllocatedAtDesc();
}
