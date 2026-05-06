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
import java.time.LocalDateTime;
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
		job.setDescription(request.getDescription());

		return jobRepository.save(job);
	}

	public Job updateJobStatus(Long jobId, String status) {
		return updateJobStatus(jobId, status, null);
	}

	public Job updateJobStatus(Long jobId, String status, Long userId) {
		JobStatus targetStatus = JobStatus.valueOf(status.toUpperCase());
		Job job = findJobById(jobId);
		Long actorId = userId != null ? userId : inferredActorId(job, targetStatus);
		switch (targetStatus) {
			case ACCEPTED -> {
				return acceptJob(jobId, actorId);
			}
			case REJECTED -> {
				return rejectJob(jobId, actorId);
			}
			case CANCELLED -> {
				return cancelJob(jobId, actorId);
			}
			case STARTED -> {
				return startJob(jobId, actorId);
			}
			case COMPLETED -> {
				return completeJob(jobId, actorId);
			}
			case REQUESTED -> throw new IllegalArgumentException("Cannot transition a job back to REQUESTED");
			default -> throw new IllegalArgumentException("Unsupported status: " + status);
		}
	}

	public Job rejectJob(Long jobId, Long workerId) {
		Job job = findJobById(jobId);
		ensureWorkerActor(job, workerId);
		requireTransition(job, JobStatus.REQUESTED, JobStatus.REJECTED);
		job.setStatus(JobStatus.REJECTED);
		return jobRepository.save(job);
	}

	public Job acceptJob(Long jobId, Long workerId) {
		Job job = findJobById(jobId);
		ensureWorkerActor(job, workerId);
		requireTransition(job, JobStatus.REQUESTED, JobStatus.ACCEPTED);
		job.setStatus(JobStatus.ACCEPTED);
		return jobRepository.save(job);
	}

	public Job startJob(Long jobId, Long workerId) {
		Job job = findJobById(jobId);
		ensureWorkerActor(job, workerId);
		requireTransition(job, JobStatus.ACCEPTED, JobStatus.STARTED);
		job.setStatus(JobStatus.STARTED);
		job.setStartedAt(LocalDateTime.now());
		return jobRepository.save(job);
	}

	public Job completeJob(Long jobId, Long workerId) {
		Job job = findJobById(jobId);
		ensureWorkerActor(job, workerId);
		requireTransition(job, JobStatus.STARTED, JobStatus.COMPLETED);
		job.setStatus(JobStatus.COMPLETED);
		job.setCompletedAt(LocalDateTime.now());
		return jobRepository.save(job);
	}

	public Job cancelJob(Long jobId, Long userId) {
		Job job = findJobById(jobId);
		User actor = findUserById(userId);

		if (job.getStatus() == JobStatus.STARTED) {
			throw new IllegalArgumentException("Cannot cancel a job after it has STARTED");
		}

		if (job.getStatus() == JobStatus.REQUESTED) {
			if (!job.getCustomer().getId().equals(actor.getId())) {
				throw new IllegalArgumentException("Only the customer can cancel a REQUESTED job");
			}
			job.setStatus(JobStatus.CANCELLED);
			return jobRepository.save(job);
		}

		if (job.getStatus() == JobStatus.ACCEPTED) {
			boolean actorIsCustomer = job.getCustomer().getId().equals(actor.getId());
			boolean actorIsWorker = job.getWorker() != null && job.getWorker().getId().equals(actor.getId());
			if (!actorIsCustomer && !actorIsWorker) {
				throw new IllegalArgumentException("Only assigned customer or worker can cancel an ACCEPTED job");
			}
			job.setStatus(JobStatus.CANCELLED);
			return jobRepository.save(job);
		}

		throw new IllegalArgumentException("Cannot cancel a job in status: " + job.getStatus());
	}

	public List<Job> getJobsForUser(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new IllegalArgumentException("User not found with id: " + userId);
		}

		return jobRepository.findByCustomerIdOrWorkerId(userId, userId);
	}

	private Job findJobById(Long jobId) {
		return jobRepository.findById(jobId)
				.orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + jobId));
	}

	private User findUserById(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
	}

	private void ensureWorkerActor(Job job, Long workerId) {
		User workerActor = findUserById(workerId);
		if (workerActor.getRole() != UserRole.WORKER) {
			throw new IllegalArgumentException("Selected worker id does not belong to a worker");
		}
		if (job.getWorker() == null || !job.getWorker().getId().equals(workerActor.getId())) {
			throw new IllegalArgumentException("Only the assigned worker can perform this action");
		}
	}

	private void requireTransition(Job job, JobStatus currentStatus, JobStatus targetStatus) {
		if (job.getStatus() != currentStatus) {
			throw new IllegalArgumentException(
					"Invalid transition: " + job.getStatus() + " to " + targetStatus);
		}
	}

	private Long inferredActorId(Job job, JobStatus targetStatus) {
		return switch (targetStatus) {
			case ACCEPTED, REJECTED, STARTED, COMPLETED -> {
				if (job.getWorker() == null) {
					throw new IllegalArgumentException("Assigned worker is required for this transition");
				}
				yield job.getWorker().getId();
			}
			case CANCELLED -> job.getCustomer().getId();
			default -> throw new IllegalArgumentException("Cannot infer actor for transition to " + targetStatus);
		};
	}
}
