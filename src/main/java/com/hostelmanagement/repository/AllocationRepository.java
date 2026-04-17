package com.hostelmanagement.repository;

import com.hostelmanagement.model.Allocation;
import com.hostelmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    Optional<Allocation> findByStudentId(Long studentId);

    long countByRoomId(Long roomId);

    List<Allocation> findAllByOrderByAllocatedAtDesc();

    @Query("select distinct al.student from Allocation al order by al.student.name")
    List<User> findAllocatedStudents();
}
