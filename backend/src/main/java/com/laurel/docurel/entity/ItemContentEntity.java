package com.laurel.docurel.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "item_content")
@Getter
@Setter
@NoArgsConstructor
public class ItemContentEntity {
    public ItemContentEntity(Long itemId, String fullText) {
        this.itemId = itemId;
        this.fullText = fullText;
    }

    @Id
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "full_text")
    private String fullText;

    @Column(name = "embedding")
    private byte[] embedding;
}
