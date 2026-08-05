package com.laurel.docurel.dto.response;

import java.util.UUID;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.enums.PermissionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SharedItemResponse extends ItemResponse {
    // private String ownerUsername;
    private PermissionType permission;

    public SharedItemResponse(ItemEntity item, UUID publicParentId, PermissionType permission) {
        super(item, publicParentId);
        this.permission = permission;
    }
}
