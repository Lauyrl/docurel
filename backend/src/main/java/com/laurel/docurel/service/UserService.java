package com.laurel.docurel.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.laurel.docurel.dto.response.UserResponse;
import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse registerUser(String username, String email, String password) {
        UserEntity entity = new UserEntity(username, email, passwordEncoder.encode(password));

        if (username != null && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is taken");
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is taken");
        }

        entity = userRepository.save(entity);
        return new UserResponse(entity);
    }

    public UserResponse loginUser(String usernameOrEmail, String password) {
        UserEntity entity = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail).orElseThrow(() ->
            new IllegalArgumentException("Wrong username, email, or password")
        );
        
        if (passwordEncoder.matches(password, entity.getPasswordHash())) {
            return new UserResponse(entity);
        }
        else throw new IllegalArgumentException("Wrong username, email, or password");
    }
}
