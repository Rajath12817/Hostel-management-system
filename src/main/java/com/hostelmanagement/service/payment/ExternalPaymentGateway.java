package com.hostelmanagement.service.payment;

public class ExternalPaymentGateway {
    public void makePayment(double value) {
        if (value <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
    }
}
