package com.hostelmanagement.service;

import com.hostelmanagement.model.User;
import com.hostelmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String email, String password) {
        if (isBlank(email) || isBlank(password)) {
            throw new BusinessException("Email and password are required");
        }
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));
        if (!user.getPassword().equals(password)) {
            throw new BusinessException("Invalid email or password");
        }
        return user;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
