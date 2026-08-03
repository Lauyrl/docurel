package com.laurel.docurel.entity;

import jakarta.persistence.*;

import java.util.UUID;

import org.hibernate.annotations.Generated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
@NoArgsConstructor
public class UserEntity {
    
    public UserEntity(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "public_id", insertable = false, updatable = false)
    @Generated(event = org.hibernate.generator.EventType.INSERT)
    private UUID publicId;
}
