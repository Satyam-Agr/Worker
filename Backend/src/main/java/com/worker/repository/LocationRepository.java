package com.worker.repository;

import com.worker.model.Location;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LocationRepository extends JpaRepository<Location, Long> {

	@Query(value = """
			select *
			from locations
			where user_id = :userId
			order by updated_at desc
			limit 1
			""", nativeQuery = true)
	Optional<Location> findLatestLocationByUserId(@Param("userId") Long userId);
}
