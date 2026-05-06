package com.worker.service;

import com.worker.dto.RegisterRequest;
import com.worker.model.User;
import com.worker.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
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
}
