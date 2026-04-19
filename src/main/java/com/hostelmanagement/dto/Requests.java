package com.hostelmanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public final class Requests {
    private Requests() {
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }

    public record TextRequest(@NotBlank String value) {
    }

    public record LeaveRequestPayload(@NotBlank String reason, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
    }

    public record RoomRequest(@NotBlank String roomNumber, @Positive int capacity, @NotBlank String status) {
    }

    public record AllocationRequest(@NotNull Long studentId, @NotNull Long roomId) {
    }

    public record AttendanceRequest(@NotNull Long studentId, @NotNull LocalDate date, @NotBlank String status) {
    }

    public record BillRequest(@NotNull Long studentId, @NotNull BigDecimal amount) {
    }

    public record AttendanceSummary(long totalDays, long presentDays, long absentDays, double percentage) {
    }
}
