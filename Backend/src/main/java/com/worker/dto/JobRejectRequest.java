package com.worker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobRejectRequest {

	@NotNull
	private Long jobId;

	@NotNull
	private Long workerId;
}
