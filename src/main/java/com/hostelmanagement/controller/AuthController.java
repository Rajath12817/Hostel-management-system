package com.hostelmanagement.controller;

import com.hostelmanagement.dto.Requests.LoginRequest;
import com.hostelmanagement.model.User;
import com.hostelmanagement.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        User user = authService.login(request.email(), request.password());
        user.setPassword("");
        return user;
    }
}
