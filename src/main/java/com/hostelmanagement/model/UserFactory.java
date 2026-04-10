package com.hostelmanagement.model;

public final class UserFactory {
    private UserFactory() {
    }

    public static User createUser(String role) {
        UserRole userRole = UserRole.valueOf(role.trim().toUpperCase());
        return switch (userRole) {
            case STUDENT -> new Student();
            case WARDEN -> new Warden();
            case ADMIN -> new Admin();
        };
    }
}
