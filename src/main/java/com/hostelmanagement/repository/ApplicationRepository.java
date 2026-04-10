package com.hostelmanagement.repository;

import com.hostelmanagement.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Application> findAllByOrderByCreatedAtDesc();

    boolean existsByStudentId(Long studentId);

    Optional<Application> findByStudentId(Long studentId);
}
