package com.laurel.docurel.entity;

import java.time.Instant;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.laurel.docurel.enums.PermissionType;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_items")
@NoArgsConstructor
public class UserItemEntity {
    
    public UserItemEntity(UserEntity user, ItemEntity item, PermissionType permission) {
        this.user = user;
        this.item = item;
        this.permission = permission;
        starred = false;
    }

    @EmbeddedId
    // Hibernate should sync this after user and item, shouldn't manually manage
    private UserItemId id = new UserItemId(); 

    // user_id column becomes the source of truth for userId, maps userId to this relationship with the UserEntity
    @MapsId("userId")                  
    // @ManyToOne: many UserItems can reference the same user (i.e. user owns multiple items)
    // FetchType.LAZY: only load the UserEntity when getUser() is first called (from the @Table associated with UserEntity)
    @ManyToOne(fetch = FetchType.LAZY)  
    // user_id is the FK to join with the PK of the @Table associated with UserEntity
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @MapsId("itemId")                  
    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "item_id")
    private ItemEntity item;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private PermissionType permission;

    private boolean starred;

    @Column(name = "last_opened", insertable = false)
	private Instant lastOpened;


}
