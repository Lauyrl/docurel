package com.laurel.docurel.dto.response;

import java.util.UUID;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.enums.PermissionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharedItemResponse {
    private ItemResponse item;
    // private String ownerUsername;
    private PermissionType permission;

    public SharedItemResponse(ItemEntity item, UUID publicParentId, PermissionType permission) {
        this.item = new ItemResponse(item, publicParentId);
        this.permission = permission;
    }
}
