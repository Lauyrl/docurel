package com.laurel.docurel.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.enums.ItemType;
import com.laurel.docurel.enums.PermissionType;

import lombok.Getter;
import lombok.Setter;

// lombok annotations
@Getter
@Setter
public class ItemResponse {
    private UUID publicParentId;
    private String name;
    private ItemType type;
    private Long sizeBytes;
    private String contentType;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastOpened;
    private UUID publicId;
    private PermissionType permission;
    private boolean isUserRoot;

    public ItemResponse(ItemEntity entity, UUID publicParentId, PermissionType permission) {
        setPublicParentId(entity.getParentId() == null ? null : publicParentId);
        setName(entity.getName());
        setType(entity.getType());
        setSizeBytes(entity.getSizeBytes());
        setContentType(entity.getContentType());
        setCreatedAt(entity.getCreatedAt());
        setUpdatedAt(entity.getUpdatedAt());
        setPublicId(entity.getPublicId());
        setPermission(permission);
        setUserRoot(false);
    }

    public ItemResponse(ItemEntity entity, UUID publicParentId, PermissionType permission, boolean isUserRoot) {
        setPublicParentId(entity.getParentId() == null ? null : publicParentId);
        setName(entity.getName());
        setType(entity.getType());
        setSizeBytes(entity.getSizeBytes());
        setContentType(entity.getContentType());
        setCreatedAt(entity.getCreatedAt());
        setUpdatedAt(entity.getUpdatedAt());
        setPublicId(entity.getPublicId());
        setPermission(permission);
        setUserRoot(isUserRoot);
    }

    public ItemResponse(ItemEntity entity, UUID publicParentId, PermissionType permission, Instant lastOpened) {
        setPublicParentId(entity.getParentId() == null ? null : publicParentId);
        setName(entity.getName());
        setType(entity.getType());
        setSizeBytes(entity.getSizeBytes());
        setContentType(entity.getContentType());
        setCreatedAt(entity.getCreatedAt());
        setUpdatedAt(entity.getUpdatedAt());
        setPublicId(entity.getPublicId());
        setPermission(permission);
        setUserRoot(false);
        setLastOpened(lastOpened);
    }

    public ItemResponse(ItemEntity entity, UUID publicParentId, PermissionType permission, boolean isUserRoot, Instant lastOpened) {
        setPublicParentId(entity.getParentId() == null ? null : publicParentId);
        setName(entity.getName());
        setType(entity.getType());
        setSizeBytes(entity.getSizeBytes());
        setContentType(entity.getContentType());
        setCreatedAt(entity.getCreatedAt());
        setUpdatedAt(entity.getUpdatedAt());
        setPublicId(entity.getPublicId());
        setPermission(permission);
        setUserRoot(isUserRoot);
        setLastOpened(lastOpened);
    }
}
