package com.laurel.docurel.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String usernameOrEmail; // "Enter usename or email"
    private String password;    
}
