package com.worker.service;

import com.worker.dto.RegisterRequest;
import com.worker.model.User;
import com.worker.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final AuthenticationManager authenticationManager;

	public UserService(UserRepository userRepository, AuthenticationManager authenticationManager) {
		this.userRepository = userRepository;
		this.authenticationManager = authenticationManager;
	}

	public User registerUser(RegisterRequest request) {
		if (userRepository.findByPhone(request.getPhone()).isPresent()) {
			throw new IllegalArgumentException("Phone number is already registered");
		}

		User user = new User();
		user.setName(request.getName());
		user.setPhone(request.getPhone());
		user.setRole(request.getRole());
		user.setLanguage(request.getLanguage());

		return userRepository.save(user);
	}

	public User getUserByPhone(String phone) {
		return userRepository.findByPhone(phone)
				.orElseThrow(() -> new IllegalArgumentException("User not found with phone: " + phone));
	}

	public User authenticateByPhone(String phone) {
		try {
			Authentication authentication = authenticationManager
					.authenticate(new PreAuthenticatedAuthenticationToken(phone, "N/A"));
			return (User) authentication.getPrincipal();
		} catch (AuthenticationException exception) {
			throw new IllegalArgumentException("User not found with phone: " + phone);
		}
	}

	public Authentication authenticate(String phone) {
		try {
			return authenticationManager.authenticate(new PreAuthenticatedAuthenticationToken(phone, "N/A"));
		} catch (AuthenticationException exception) {
			throw new IllegalArgumentException("User not found with phone: " + phone);
		}
	}
}
