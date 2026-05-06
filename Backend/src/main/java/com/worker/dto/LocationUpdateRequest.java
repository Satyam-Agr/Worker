package com.worker.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateRequest {

	@NotNull
	private Long userId;

	@NotNull
	@DecimalMin("-90.0")
	@DecimalMax("90.0")
	private Double latitude;

	@NotNull
	@DecimalMin("-180.0")
	@DecimalMax("180.0")
	private Double longitude;
}
