package com.laurel.docurel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.laurel.docurel.enums.ItemType;

// lombok annotations
@Getter
@Setter
// jpa annotations
@Entity
@Table(name = "items")
@NoArgsConstructor
public class ItemEntity {

    public ItemEntity(String name, Long parent_id, ItemType type, Long sizeBytes) {
        this.name = name;
        this.parentId = parent_id;
        this.type = type;
        this.sizeBytes = sizeBytes;
        if (type == ItemType.DOCUMENT) this.contentType = getContentTypeFromFilename(name);
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    private Long parentId;

    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "item_type")
    private ItemType type;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", insertable = false)
    private Instant updatedAt;

    @Column(name = "public_id", insertable = false, updatable = false)
    @Generated(event = org.hibernate.generator.EventType.INSERT)
    private UUID publicId;

    public static String getContentTypeFromFilename(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1);
        return switch (extension) {
            case "txt"  -> "text/plain";

            case "jpg"  -> "image/jpeg";
            case "png"  -> "image/png";
            case "gif"  -> "image/gif";
            case "webp" -> "image/webp";

            case "mp4"  -> "video/mp4";
            case "webm" -> "video/webm";

            case "wav"  -> "audio/wav";
            case "mp3"  -> "audio/mp3";

            case "pdf"  -> "application/pdf";
            default     -> "application/octet-stream";
        };
    }
}
