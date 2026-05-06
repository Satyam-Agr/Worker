package com.worker.repository;

import com.worker.model.WorkerProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {

	List<WorkerProfile> findByIsAvailableTrue();

	List<WorkerProfile> findByCategoryIdAndIsAvailableTrue(Long categoryId);

	Optional<WorkerProfile> findByUserId(Long userId);
}
