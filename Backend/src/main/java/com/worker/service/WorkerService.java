package com.worker.service;

import com.worker.model.WorkerProfile;
import com.worker.repository.WorkerProfileRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class WorkerService {

	private final WorkerProfileRepository workerProfileRepository;

	public WorkerService(WorkerProfileRepository workerProfileRepository) {
		this.workerProfileRepository = workerProfileRepository;
	}

	public WorkerProfile setAvailability(Long userId, boolean status) {
		WorkerProfile workerProfile = workerProfileRepository.findByUserId(userId)
				.orElseThrow(() -> new IllegalArgumentException("Worker profile not found for user id: " + userId));

		workerProfile.setAvailable(status);
		return workerProfileRepository.save(workerProfile);
	}

	public List<WorkerProfile> getAvailableWorkersByCategory(Long categoryId) {
		return workerProfileRepository.findByCategoryIdAndIsAvailableTrue(categoryId);
	}
}
