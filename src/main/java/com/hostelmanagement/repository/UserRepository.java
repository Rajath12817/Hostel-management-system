package com.hostelmanagement.repository;

import com.hostelmanagement.model.User;
import com.hostelmanagement.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRoleOrderByName(UserRole role);

    @Query("select distinct a.student from Application a where a.status = com.hostelmanagement.model.ApplicationStatus.APPROVED order by a.student.name")
    List<User> findApprovedStudents();

    @Query("select distinct a.student from Application a where a.status = com.hostelmanagement.model.ApplicationStatus.APPROVED and not exists (select al from Allocation al where al.student = a.student) order by a.student.name")
    List<User> findAllocatableStudents();
}
