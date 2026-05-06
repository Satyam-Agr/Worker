package com.worker.controller;

import com.worker.dto.LocationUpdateRequest;
import com.worker.model.Location;
import com.worker.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/location")
public class LocationController {

	private final LocationService locationService;

	public LocationController(LocationService locationService) {
		this.locationService = locationService;
	}

	@PostMapping("/update")
	public ResponseEntity<Location> updateLocation(@Valid @RequestBody LocationUpdateRequest request) {
		Location location = locationService.updateLocation(
				request.getUserId(),
				request.getLatitude(),
				request.getLongitude());
		return ResponseEntity.ok(location);
	}
}
