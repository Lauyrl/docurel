package com.laurel.docurel.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor  // so that Hibernate can make a new UserItemId to parse the DB
@AllArgsConstructor // convinience
@EqualsAndHashCode  // for comparison, since it's a manually defined class, instead of built-in like Long
public class UserItemId implements Serializable {
    // no @GeneratedValue, since this table isn't the one that generates them, just stores them
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "item_id")
    private Long itemId;

}
