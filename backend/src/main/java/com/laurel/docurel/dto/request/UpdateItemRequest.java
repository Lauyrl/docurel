package com.laurel.docurel.dto.request;

import java.util.UUID;

import lombok.Getter;

@Getter
public class UpdateItemRequest {
    private String name;
    private UUID publicParentId;

    public String getName() {
        return name;
    }

    public UUID getPublicParentId() {
        return publicParentId;
    }
}
