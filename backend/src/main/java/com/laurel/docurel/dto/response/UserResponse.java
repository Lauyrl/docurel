package com.laurel.docurel.dto.response;

import com.laurel.docurel.entity.UserEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private String username;
    private String email;

    public UserResponse(UserEntity entity) {
        this.username = entity.getUsername();
        this.email = entity.getEmail();
    }
}
