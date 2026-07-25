package com.laurel.docurel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

import com.laurel.docurel.enums.ItemType;

// lombok annotations
@Getter
@Setter
// jpa annotations
@Entity
@Table(name = "items")
public class ItemEntity {
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
}
