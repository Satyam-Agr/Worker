package com.worker.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class JobStatusSchemaFixer implements CommandLineRunner {

	private final JdbcTemplate jdbcTemplate;

	public JobStatusSchemaFixer(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public void run(String... args) {
		String dataType = jdbcTemplate.queryForObject(
				"""
				select data_type
				from information_schema.columns
				where table_schema = database()
				  and table_name = 'jobs'
				  and column_name = 'status'
				""",
				String.class);

		if (dataType != null && dataType.equalsIgnoreCase("enum")) {
			jdbcTemplate.execute("alter table jobs modify column status varchar(32) not null");
		}
	}
}
