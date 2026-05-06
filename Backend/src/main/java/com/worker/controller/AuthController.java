package com.worker.controller;

import com.worker.dto.LoginRequest;
import com.worker.dto.MessageResponse;
import com.worker.dto.RegisterRequest;
import com.worker.model.User;
import com.worker.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(request));
	}

	@PostMapping("/login")
	public ResponseEntity<User> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		Authentication authentication = userService.authenticate(request.getPhone());
		SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
		securityContext.setAuthentication(authentication);
		SecurityContextHolder.setContext(securityContext);
		httpRequest.getSession(true)
				.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

		return ResponseEntity.ok((User) authentication.getPrincipal());
	}

	@PostMapping("/logout")
	public ResponseEntity<MessageResponse> logout(
			HttpServletRequest httpRequest,
			HttpServletResponse httpResponse,
			Authentication authentication) {
		new SecurityContextLogoutHandler().logout(httpRequest, httpResponse, authentication);
		return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
	}
}
