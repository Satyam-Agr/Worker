package com.worker.service;

import com.worker.model.Category;
import com.worker.model.User;
import com.worker.model.WorkerProfile;
import com.worker.model.enums.UserRole;
import com.worker.repository.CategoryRepository;
import com.worker.repository.UserRepository;
import com.worker.repository.WorkerProfileRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class WorkerService {

	private final WorkerProfileRepository workerProfileRepository;
	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;

	public WorkerService(
			WorkerProfileRepository workerProfileRepository,
			UserRepository userRepository,
			CategoryRepository categoryRepository) {
		this.workerProfileRepository = workerProfileRepository;
		this.userRepository = userRepository;
		this.categoryRepository = categoryRepository;
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

	public WorkerProfile getWorkerProfileByUserId(Long userId) {
		return workerProfileRepository.findByUserId(userId)
				.orElseThrow(() -> new IllegalArgumentException("Worker profile not found for user id: " + userId));
	}

	public WorkerProfile createWorkerProfile(Long userId, Long categoryId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
		if (user.getRole() != UserRole.WORKER) {
			throw new IllegalArgumentException("Selected user id does not belong to a worker");
		}

		if (workerProfileRepository.findByUserId(userId).isPresent()) {
			throw new IllegalArgumentException("Worker profile already exists for user id: " + userId);
		}

		Category category = categoryRepository.findById(categoryId)
				.orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));

		WorkerProfile workerProfile = new WorkerProfile();
		workerProfile.setUser(user);
		workerProfile.setCategory(category);
		workerProfile.setAvailable(false);
		workerProfile.setRating(0.0);
		workerProfile.setTotalJobs(0);

		return workerProfileRepository.save(workerProfile);
	}
}
