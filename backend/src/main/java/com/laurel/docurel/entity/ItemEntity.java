package com.laurel.docurel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

import com.laurel.docurel.enums.ItemType;

// lombok annotations
@Getter
@Setter
// jpa annotations
@Entity
@Table(name = "items")
public class ItemEntity {
    protected ItemEntity() {}

    public ItemEntity(String name, Long parent_id, ItemType type, Long sizeByes) {
        setName(name);
        setParentId(parent_id);
        setType(type);
        setSizeBytes(sizeByes);
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    private Long parentId;

    private String name;

    @Enumerated(EnumType.STRING) 
    private ItemType type;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "public_id")
    private UUID publicId;
}
