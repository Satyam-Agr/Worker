package com.worker.service;

import com.worker.dto.JobCreateRequest;
import com.worker.model.Category;
import com.worker.model.Job;
import com.worker.model.User;
import com.worker.model.enums.JobStatus;
import com.worker.model.enums.UserRole;
import com.worker.repository.CategoryRepository;
import com.worker.repository.JobRepository;
import com.worker.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class JobService {

	private final JobRepository jobRepository;
	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;

	public JobService(
			JobRepository jobRepository,
			UserRepository userRepository,
			CategoryRepository categoryRepository) {
		this.jobRepository = jobRepository;
		this.userRepository = userRepository;
		this.categoryRepository = categoryRepository;
	}

	public Job createJob(JobCreateRequest request) {
		User customer = userRepository.findById(request.getCustomerId())
				.orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + request.getCustomerId()));
		User worker = userRepository.findById(request.getWorkerId())
				.orElseThrow(() -> new IllegalArgumentException("Worker not found with id: " + request.getWorkerId()));
		Category category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));

		if (customer.getRole() != UserRole.CUSTOMER) {
			throw new IllegalArgumentException("Selected customer id does not belong to a customer");
		}
		if (worker.getRole() != UserRole.WORKER) {
			throw new IllegalArgumentException("Selected worker id does not belong to a worker");
		}

		Job job = new Job();
		job.setCustomer(customer);
		job.setWorker(worker);
		job.setCategory(category);
		job.setStatus(JobStatus.REQUESTED);
		job.setPrice(category.getBasePrice());

		return jobRepository.save(job);
	}

	public Job updateJobStatus(Long jobId, String status) {
		Job job = jobRepository.findById(jobId)
				.orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + jobId));

		job.setStatus(JobStatus.valueOf(status.toUpperCase()));
		return jobRepository.save(job);
	}

	public List<Job> getJobsForUser(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new IllegalArgumentException("User not found with id: " + userId);
		}

		return jobRepository.findByCustomerIdOrWorkerId(userId, userId);
	}
}
