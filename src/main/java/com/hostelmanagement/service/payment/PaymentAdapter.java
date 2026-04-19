package com.hostelmanagement.service.payment;

import org.springframework.stereotype.Service;

@Service
public class PaymentAdapter implements PaymentService {
    private final ExternalPaymentGateway gateway = new ExternalPaymentGateway();

    @Override
    public void pay(double amount) {
        gateway.makePayment(amount);
    }
}
