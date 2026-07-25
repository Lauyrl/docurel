package com.laurel.docurel.dto;

import java.time.Instant;
import java.util.UUID;

import com.laurel.docurel.enums.ItemType;

import lombok.Getter;
import lombok.Setter;

// lombok annotations
@Getter
@Setter
public class ItemResponse {
    private Long parentId;
    private String name;
    private ItemType type;
    private Long sizeBytes;
    private String contentType;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID publicId;
}
