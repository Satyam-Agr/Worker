package com.worker.security;

import com.worker.model.User;
import com.worker.repository.UserRepository;
import java.util.List;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class PhoneAuthenticationProvider implements AuthenticationProvider {

	private final UserRepository userRepository;

	public PhoneAuthenticationProvider(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		String phone = authentication.getPrincipal() == null ? "" : authentication.getPrincipal().toString();
		if (phone.isBlank()) {
			throw new BadCredentialsException("Phone is required");
		}

		User user = userRepository.findByPhone(phone)
				.orElseThrow(() -> new BadCredentialsException("User not found with phone: " + phone));

		return new PreAuthenticatedAuthenticationToken(
				user,
				authentication.getCredentials(),
				List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
	}

	@Override
	public boolean supports(Class<?> authentication) {
		return PreAuthenticatedAuthenticationToken.class.isAssignableFrom(authentication);
	}
}
