package com.laurel.docurel.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.laurel.docurel.entity.ItemEntity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FolderResponse extends ItemResponse {
    private List<ItemResponse> children = new ArrayList<>();

    public FolderResponse(ItemEntity entity, UUID publicParentId) {
        super(entity, publicParentId);
    }
}
