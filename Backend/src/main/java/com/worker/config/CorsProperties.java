package com.worker.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

	private List<String> allowedOrigins = List.of(
		"http://localhost:3000",
    	"http://127.0.0.1:3000"
	);

	private List<String> allowedMethods = List.of(
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE",
		"OPTIONS"
	);

	private List<String> allowedHeaders = List.of("*");

	private List<String> exposedHeaders = List.of();

	private boolean allowCredentials = true;

	public List<String> getAllowedOrigins() {
		return allowedOrigins;
	}

	public void setAllowedOrigins(List<String> allowedOrigins) {
		this.allowedOrigins = allowedOrigins;
	}

	public List<String> getAllowedMethods() {
		return allowedMethods;
	}

	public void setAllowedMethods(List<String> allowedMethods) {
		this.allowedMethods = allowedMethods;
	}

	public List<String> getAllowedHeaders() {
		return allowedHeaders;
	}

	public void setAllowedHeaders(List<String> allowedHeaders) {
		this.allowedHeaders = allowedHeaders;
	}

	public List<String> getExposedHeaders() {
		return exposedHeaders;
	}

	public void setExposedHeaders(List<String> exposedHeaders) {
		this.exposedHeaders = exposedHeaders;
	}

	public boolean isAllowCredentials() {
		return allowCredentials;
	}

	public void setAllowCredentials(boolean allowCredentials) {
		this.allowCredentials = allowCredentials;
	}
}