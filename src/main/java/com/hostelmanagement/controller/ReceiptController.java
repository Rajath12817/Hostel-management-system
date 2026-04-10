package com.hostelmanagement.controller;

import com.hostelmanagement.service.ReceiptService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReceiptController {
    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping("/receipt/{paymentId}")
    public ResponseEntity<byte[]> receipt(@PathVariable Long paymentId) {
        byte[] pdf = receiptService.generateReceipt(paymentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename("receipt-" + paymentId + ".pdf")
                                .build()
                                .toString())
                .body(pdf);
    }
}
