package com.worker.service;

import com.worker.model.Location;
import com.worker.model.User;
import com.worker.model.WorkerProfile;
import com.worker.repository.LocationRepository;
import com.worker.repository.UserRepository;
import com.worker.repository.WorkerProfileRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class LocationService {

	private static final double EARTH_RADIUS_KM = 6371.0;

	private final LocationRepository locationRepository;
	private final UserRepository userRepository;
	private final WorkerProfileRepository workerProfileRepository;

	public LocationService(
			LocationRepository locationRepository,
			UserRepository userRepository,
			WorkerProfileRepository workerProfileRepository) {
		this.locationRepository = locationRepository;
		this.userRepository = userRepository;
		this.workerProfileRepository = workerProfileRepository;
	}

	public Location updateLocation(Long userId, double lat, double lng) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

		Location location = locationRepository.findLatestLocationByUserId(userId)
				.orElseGet(Location::new);
		location.setUser(user);
		location.setLatitude(BigDecimal.valueOf(lat));
		location.setLongitude(BigDecimal.valueOf(lng));

		return locationRepository.save(location);
	}

	public List<WorkerProfile> getNearbyWorkers(double lat, double lng, Long categoryId, double radiusKm) {
		return workerProfileRepository.findByCategoryIdAndIsAvailableTrue(categoryId)
				.stream()
				.map(worker -> toWorkerDistance(worker, lat, lng))
				.flatMap(Optional::stream)
				.filter(workerDistance -> workerDistance.distanceKm() <= radiusKm)
				.sorted((left, right) -> Double.compare(left.distanceKm(), right.distanceKm()))
				.map(WorkerDistance::worker)
				.toList();
	}

	private Optional<WorkerDistance> toWorkerDistance(WorkerProfile worker, double lat, double lng) {
		return locationRepository.findLatestLocationByUserId(worker.getUser().getId())
				.map(location -> new WorkerDistance(
						worker,
						calculateDistanceKm(
						lat,
						lng,
						location.getLatitude().doubleValue(),
						location.getLongitude().doubleValue())));
	}

	private double calculateDistanceKm(double lat1, double lng1, double lat2, double lng2) {
		double latDistance = Math.toRadians(lat2 - lat1);
		double lngDistance = Math.toRadians(lng2 - lng1);
		double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
				+ Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
				* Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return EARTH_RADIUS_KM * c;
	}

	private record WorkerDistance(WorkerProfile worker, double distanceKm) {
	}
}
