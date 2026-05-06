package com.worker.controller;

import com.worker.dto.WorkerAvailabilityRequest;
import com.worker.model.WorkerProfile;
import com.worker.service.WorkerService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/worker")
public class WorkerController {

	private final WorkerService workerService;

	public WorkerController(WorkerService workerService) {
		this.workerService = workerService;
	}

	@PostMapping("/availability")
	public ResponseEntity<WorkerProfile> setAvailability(@Valid @RequestBody WorkerAvailabilityRequest request) {
		WorkerProfile workerProfile = workerService.setAvailability(request.getUserId(), request.getIsAvailable());
		return ResponseEntity.ok(workerProfile);
	}

	@GetMapping("/available")
	public ResponseEntity<List<WorkerProfile>> getAvailableWorkers(@RequestParam Long categoryId) {
		return ResponseEntity.ok(workerService.getAvailableWorkersByCategory(categoryId));
	}
}
