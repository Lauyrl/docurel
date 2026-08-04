package com.laurel.docurel.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.laurel.docurel.dto.response.LoginResponse;
import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.entity.UserItemEntity;
import com.laurel.docurel.enums.ItemType;
import com.laurel.docurel.enums.PermissionType;
import com.laurel.docurel.repository.ItemRepository;
import com.laurel.docurel.repository.UserItemRepository;
import com.laurel.docurel.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional // so failed query pipelines can be rolled back
public class UserService {
    private static final Long GLOBAL_ROOT_ID = 0L;

    private final PasswordEncoder passwordEncoder;
    private final UserItemRepository userItemRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final JwtService jwtService;

    public LoginResponse registerUser(String username, String email, String password) {
        UserEntity user = new UserEntity(username, email, passwordEncoder.encode(password));

        if (username != null && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is taken");
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is taken");
        }
        user = userRepository.save(user);

        String identifier = (username == null ? email : username);

        // above already checks duplicate folder name (identifier can't be duplicate since username and email can't)
        ItemEntity userRootFolder = itemRepository.save(new ItemEntity(identifier, GLOBAL_ROOT_ID, ItemType.FOLDER, null));
        // can't use getCurrentUser, since if user is trying to register, they probably don't have a JWT token yet, 
        // meaning the request falls past JwtAuthenticationFilter, and no UserEntity would have been loaded into SecurityContextHolder
        userItemRepository.save(new UserItemEntity(user, userRootFolder, PermissionType.OWNER));

        return new LoginResponse(user, jwtService.generateToken(user));
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

    public UserEntity getUserByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail).orElseThrow();
    }
}
