package com.laurel.docurel.dto.request;

import lombok.Getter;

@Getter
public class SetPermissionsRequest {
    String usernameOrEmail;
    String permissionString;
}
