package com.hostelmanagement.repository;

import com.hostelmanagement.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(Long studentId);

    List<Attendance> findAllByOrderByAttendanceDateDesc();

    @Query("select a from Attendance a where a.attendanceDate = :date order by a.student.name")
    List<Attendance> findByDateForWarden(@Param("date") LocalDate attendanceDate);

    Optional<Attendance> findByStudentIdAndAttendanceDate(Long studentId, LocalDate attendanceDate);
}
