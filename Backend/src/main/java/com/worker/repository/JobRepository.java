package com.worker.repository;

import com.worker.model.Job;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {

	List<Job> findByCustomerId(Long customerId);

	List<Job> findByWorkerId(Long workerId);

	List<Job> findByCustomerIdOrWorkerId(Long customerId, Long workerId);
}
