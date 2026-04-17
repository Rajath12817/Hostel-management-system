package com.hostelmanagement.model;

public final class UserFactory {
    private UserFactory() {
    }

    public static User createUser(String type) {
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("User type is required");
        }
        UserRole userRole = UserRole.valueOf(type.trim().toUpperCase());
        return switch (userRole) {
            case STUDENT -> new Student();
            case WARDEN -> new Warden();
            case ADMIN -> new Admin();
        };
    }
}
