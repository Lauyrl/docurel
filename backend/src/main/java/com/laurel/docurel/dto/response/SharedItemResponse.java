package com.laurel.docurel.dto.response;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.enums.PermissionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharedItemResponse {
    private ItemEntity item;
    // private String ownerUsername;
    private PermissionType permission;

    public SharedItemResponse(ItemEntity item, PermissionType permission) {
        this.item = item;
        this.permission = permission;
    }
}
