package com.hostelmanagement.repository;

import com.hostelmanagement.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Application> findAllByOrderByCreatedAtDesc();
}
