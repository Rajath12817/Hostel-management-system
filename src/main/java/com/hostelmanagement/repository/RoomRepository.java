package com.hostelmanagement.repository;

import com.hostelmanagement.model.Room;
import com.hostelmanagement.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatusOrderByRoomNumber(RoomStatus status);

    Optional<Room> findByRoomNumber(String roomNumber);
}
