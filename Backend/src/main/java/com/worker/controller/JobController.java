package com.worker.controller;

import com.worker.dto.JobCreateRequest;
import com.worker.dto.JobStatusUpdateRequest;
import com.worker.model.Job;
import com.worker.service.JobService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/job")
public class JobController {

	private final JobService jobService;

	public JobController(JobService jobService) {
		this.jobService = jobService;
	}

	@PostMapping("/create")
	public ResponseEntity<Job> createJob(@Valid @RequestBody JobCreateRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(request));
	}

	@PutMapping("/status")
	public ResponseEntity<Job> updateJobStatus(@Valid @RequestBody JobStatusUpdateRequest request) {
		return ResponseEntity.ok(jobService.updateJobStatus(request.getJobId(), request.getStatus().name()));
	}

	@GetMapping("/user/{id}")
	public ResponseEntity<List<Job>> getJobsForUser(@PathVariable Long id) {
		return ResponseEntity.ok(jobService.getJobsForUser(id));
	}
}
