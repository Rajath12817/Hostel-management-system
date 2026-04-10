package com.hostelmanagement.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("STUDENT")
public class Student extends User {
    public Student() {
        super(UserRole.STUDENT);
    }
}
