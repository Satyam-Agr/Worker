package com.worker.dto;

import com.worker.model.enums.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobStatusUpdateRequest {

	@NotNull
	private Long jobId;

	@NotNull
	private JobStatus status;

	private Long userId;
}
