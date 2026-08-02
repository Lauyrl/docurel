package com.laurel.docurel.dto.response;

import com.laurel.docurel.entity.UserEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String username;
    private String email;
    private String jwtToken;

    public LoginResponse(UserEntity entity, String jwtToken) {
        this.username = entity.getUsername();
        this.email = entity.getEmail();
        this.jwtToken = jwtToken;
    }
}
