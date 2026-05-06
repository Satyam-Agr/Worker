package com.worker.service;

import com.worker.dto.ReviewCreateRequest;
import com.worker.model.Job;
import com.worker.model.Review;
import com.worker.model.User;
import com.worker.model.WorkerProfile;
import com.worker.model.enums.JobStatus;
import com.worker.model.enums.UserRole;
import com.worker.repository.JobRepository;
import com.worker.repository.ReviewRepository;
import com.worker.repository.UserRepository;
import com.worker.repository.WorkerProfileRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

	private final ReviewRepository reviewRepository;
	private final JobRepository jobRepository;
	private final UserRepository userRepository;
	private final WorkerProfileRepository workerProfileRepository;

	public ReviewService(
			ReviewRepository reviewRepository,
			JobRepository jobRepository,
			UserRepository userRepository,
			WorkerProfileRepository workerProfileRepository) {
		this.reviewRepository = reviewRepository;
		this.jobRepository = jobRepository;
		this.userRepository = userRepository;
		this.workerProfileRepository = workerProfileRepository;
	}

	@Transactional
	public Review createReview(ReviewCreateRequest request) {
		Job job = jobRepository.findById(request.getJobId())
				.orElseThrow(() -> new IllegalArgumentException("Job not found with id: " + request.getJobId()));
		User reviewer = userRepository.findById(request.getReviewerId())
				.orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getReviewerId()));

		if (job.getStatus() != JobStatus.COMPLETED) {
			throw new IllegalArgumentException("Review can only be created for COMPLETED jobs");
		}

		if (reviewRepository.existsByJobIdAndReviewerId(job.getId(), reviewer.getId())) {
			throw new IllegalArgumentException("You have already reviewed this job");
		}

		boolean reviewerIsCustomer = job.getCustomer().getId().equals(reviewer.getId());
		boolean reviewerIsWorker = job.getWorker() != null && job.getWorker().getId().equals(reviewer.getId());
		if (!reviewerIsCustomer && !reviewerIsWorker) {
			throw new IllegalArgumentException("Reviewer must be part of this job");
		}

		User reviewee = reviewerIsCustomer ? job.getWorker() : job.getCustomer();
		if (reviewee == null) {
			throw new IllegalArgumentException("This job does not have a worker assigned");
		}

		Review review = new Review();
		review.setJob(job);
		review.setReviewer(reviewer);
		review.setReviewee(reviewee);
		review.setRating(request.getRating());
		review.setComment(request.getComment());

		Review savedReview = reviewRepository.save(review);
		updateWorkerRatingIfNeeded(reviewee);
		return savedReview;
	}

	public List<Review> getReviewsForUser(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new IllegalArgumentException("User not found with id: " + userId);
		}
		return reviewRepository.findByRevieweeId(userId);
	}

	private void updateWorkerRatingIfNeeded(User reviewee) {
		if (reviewee.getRole() != UserRole.WORKER) {
			return;
		}

		WorkerProfile workerProfile = workerProfileRepository.findByUserId(reviewee.getId())
				.orElseThrow(() -> new IllegalArgumentException(
						"Worker profile not found for user id: " + reviewee.getId()));

		Double averageRating = reviewRepository.findAverageRatingByRevieweeId(reviewee.getId());
		workerProfile.setRating(averageRating == null ? 0.0 : averageRating);
		workerProfileRepository.save(workerProfile);
	}
}
