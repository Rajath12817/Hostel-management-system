package com.hostelmanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class Requests {
    private Requests() {
    }

    public record LoginRequest(String email, String password) {
    }

    public record TextRequest(String value) {
    }

    public record LeaveRequestPayload(String reason, LocalDate startDate, LocalDate endDate) {
    }

    public record RoomRequest(String roomNumber, int capacity, String status) {
    }

    public record AllocationRequest(Long studentId, Long roomId) {
    }

    public record AttendanceRequest(Long studentId, LocalDate date, String status) {
    }

    public record BillRequest(Long studentId, BigDecimal amount) {
    }

    public record AttendanceSummary(long totalDays, long presentDays, long absentDays, double percentage) {
    }
}
