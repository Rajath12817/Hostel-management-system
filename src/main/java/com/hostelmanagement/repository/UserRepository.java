package com.hostelmanagement.repository;

import com.hostelmanagement.model.User;
import com.hostelmanagement.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRoleOrderByName(UserRole role);
}
