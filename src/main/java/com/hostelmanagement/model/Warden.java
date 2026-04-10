package com.hostelmanagement.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("WARDEN")
public class Warden extends User {
    public Warden() {
        super(UserRole.WARDEN);
    }
}
