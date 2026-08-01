package com.laurel.docurel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.laurel.docurel.dto.request.AuthRequest;
import com.laurel.docurel.dto.request.LoginRequest;
import com.laurel.docurel.dto.response.UserResponse;
import com.laurel.docurel.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final UserService userService;

    @PostMapping("/register") // register a new user
    public ResponseEntity<UserResponse> register(@RequestBody AuthRequest request) {
        UserResponse user = userService.registerUser(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login") // login as an existing user
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request) {
        UserResponse user = userService.loginUser(request.getUsernameOrEmail(), request.getPassword());
        return ResponseEntity.ok(user);
    }
}
