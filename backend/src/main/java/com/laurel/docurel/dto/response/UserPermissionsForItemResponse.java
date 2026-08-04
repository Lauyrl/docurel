package com.laurel.docurel.dto.response;

import com.laurel.docurel.enums.PermissionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPermissionsForItemResponse {
    private String username;
    private PermissionType permission;

    public UserPermissionsForItemResponse(String username, PermissionType permission) {
        this.username = username;
        this.permission = permission;
    }
}
