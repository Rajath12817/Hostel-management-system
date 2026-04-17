package com.hostelmanagement.repository;

import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;

@Repository
public class HostelJdbcRepository {
    public boolean applicationExists(Long studentId) {
        return exists("select count(*) from applications where student_id = ?", studentId);
    }

    public boolean attendanceExists(Long studentId, LocalDate date) {
        try (PreparedStatement statement = DBConnection.getInstance().getConnection()
                .prepareStatement("select count(*) from attendance where student_id = ? and attendance_date = ?")) {
            statement.setLong(1, studentId);
            statement.setDate(2, java.sql.Date.valueOf(date));
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() && resultSet.getLong(1) > 0;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not validate attendance record", exception);
        }
    }

    private boolean exists(String sql, Long studentId) {
        try (PreparedStatement statement = DBConnection.getInstance().getConnection().prepareStatement(sql)) {
            statement.setLong(1, studentId);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() && resultSet.getLong(1) > 0;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not validate database state", exception);
        }
    }
}
