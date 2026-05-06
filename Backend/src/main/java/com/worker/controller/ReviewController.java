package com.worker.controller;

import com.worker.dto.ReviewCreateRequest;
import com.worker.model.Review;
import com.worker.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/review")
public class ReviewController {

	private final ReviewService reviewService;

	public ReviewController(ReviewService reviewService) {
		this.reviewService = reviewService;
	}

	@PostMapping("/create")
	public ResponseEntity<Review> createReview(@Valid @RequestBody ReviewCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request));
	}

	@GetMapping("/user/{id}")
	public ResponseEntity<List<Review>> getReviewsForUser(@PathVariable Long id) {
		return ResponseEntity.ok(reviewService.getReviewsForUser(id));
	}
}
