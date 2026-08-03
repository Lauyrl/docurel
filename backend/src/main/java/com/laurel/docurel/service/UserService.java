package com.laurel.docurel.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.laurel.docurel.dto.response.LoginResponse;
import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.exception.InvalidPermissionsException;
import com.laurel.docurel.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Long GLOBAL_ROOT_ID = 0L;

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ItemService itemService;

    public LoginResponse registerUser(String username, String email, String password) {
        UserEntity entity = new UserEntity(username, email, passwordEncoder.encode(password));

        if (username != null && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is taken");
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is taken");
        }

        entity = userRepository.save(entity);
        String identifier = (username == null ? email : username);
        try { itemService.createDirectory(identifier, itemService.getItemPublicId(GLOBAL_ROOT_ID)); }
        catch (InvalidPermissionsException e) { /* creation of user root in global root is allowed upon registration */}
        return new LoginResponse(entity, jwtService.generateToken(entity));
    }

    public LoginResponse loginUser(String usernameOrEmail, String password) {
        UserEntity entity = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail).orElseThrow(() ->
            new IllegalArgumentException("Wrong username, email, or password")
        );
        
        if (passwordEncoder.matches(password, entity.getPasswordHash())) {
            return new LoginResponse(entity, jwtService.generateToken(entity));
        }
        else throw new IllegalArgumentException("Wrong username, email, or password");
    }

    //-----helpers
    public UserEntity getCurrentUserEntity() {
        return (UserEntity) SecurityContextHolder.getContext().getAuthentication().getPrincipal(); // JwtAuthenticationFilter already checks the principal (user) != null
    }
}
