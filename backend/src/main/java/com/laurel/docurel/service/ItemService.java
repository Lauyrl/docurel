package com.laurel.docurel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laurel.docurel.dto.response.ItemResponse;
import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.enums.ItemType;
import com.laurel.docurel.repository.ItemRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {
    private static final String STORAGE_PATH = "C:\\CS\\docurel\\storage\\";

    private final ItemRepository itemRepository;

    public List<ItemResponse> getDocuments() {
        List<ItemEntity> entities = itemRepository.findAll();

        List<ItemResponse> responses = new ArrayList<>();
        for (ItemEntity entity : entities) {
            responses.add(new ItemResponse(entity, itemRepository.findPublicIdById(entity.getParentId())));
        }
        return responses;
    }

    @SuppressWarnings("null")
    public ItemResponse storeDocument(MultipartFile document, UUID publicParentId) throws IOException {
        Long parentId = itemRepository.findIdByPublicId(publicParentId);
        String filename = Objects.requireNonNull(document.getOriginalFilename());
        
        if (itemRepository.existsByParentIdAndName(parentId, filename))  {
            throw new IllegalArgumentException("An item with that name already exists in that location");
        }
        ItemEntity entity = new ItemEntity(filename, parentId, ItemType.DOCUMENT, document.getSize());
        itemRepository.save(entity);

        Path dest = Path.of(STORAGE_PATH, entity.getId().toString());            
        document.transferTo(dest);

        return new ItemResponse(entity, itemRepository.findPublicIdById(parentId));
    }

    public byte[] getFileBytes(UUID publicId) throws IOException {
        Long id = itemRepository.findIdByPublicId(publicId);
        Path loc = Path.of(STORAGE_PATH, id.toString());
        return Files.readAllBytes(loc); 
    }

    public void deleteDocument(UUID publicId) throws IOException {
        Long id = itemRepository.findIdByPublicId(publicId);
        Path loc = Path.of(STORAGE_PATH, id.toString());
        itemRepository.deleteById(id);
        Files.delete(loc);
    }

    // only create a logical Folder entry on the DB
    public ItemResponse createDirectory(String foldername, UUID publicParentId) {
        Long parentId = itemRepository.findIdByPublicId(publicParentId);
        if (itemRepository.existsByParentIdAndName(parentId, foldername))  {
            throw new IllegalArgumentException("An item with that name already exists in that location");
        }

        ItemEntity folderEntity = itemRepository.save(new ItemEntity(foldername, parentId, ItemType.FOLDER, null));
        return new ItemResponse(folderEntity, itemRepository.findPublicIdById(parentId));
    }

    @SuppressWarnings("null")
    public void deleteDirectory(UUID publicId) throws IOException {
        Long rootId = itemRepository.findIdByPublicId(publicId);
        List<Long> toDeleteIds = itemRepository.findDocumentIdsByAncestorId(rootId);
        for (Long id : toDeleteIds) {
            Path loc = Path.of(STORAGE_PATH, id.toString());
            Files.delete(loc);
        }
        itemRepository.deleteById(rootId);
    }

    public void updateItem(UUID publicId, String newName, UUID newPublicParentId) {
        ItemEntity entityToUpdate = itemRepository.findByPublicId(publicId).orElseThrow();
        if           (newName != null) entityToUpdate.setName(newName);
        if (newPublicParentId != null) {
            ItemEntity newParent = itemRepository.findByPublicId(newPublicParentId).orElseThrow();
            Long entityId = entityToUpdate.getId();
            Long oldParentId = entityToUpdate.getParentId();
            Long newParentId = newParent.getId();
            if (newParent.getType() != ItemType.FOLDER ||
                Objects.equals(entityId, newParentId)  ||
                Objects.equals(oldParentId, newParentId)) return;
            if (entityToUpdate.getType() == ItemType.FOLDER && 
                itemRepository.isDescendant(entityId, newParentId)) {
                    throw new IllegalArgumentException("Cannot move a folder into one of its' descendants");
                }
            entityToUpdate.setParentId(newParentId);
        } 
        itemRepository.save(entityToUpdate);
    }

//-----helpers
    public String getItemName(UUID publicId) {
        return itemRepository.findNameByPublicId(publicId);
    }

    public String getItemContentType(UUID publicId) {
        return itemRepository.findContentTypeByPublicId(publicId);
    }

    // @SuppressWarnings("null")
    // // + throw proper exception from .orElseThrow();
    // private FolderResponse buildFolderTree(Long id) {
    //     try {
    //         ItemEntity folderEntity = itemRepository.findById(id).orElseThrow();    
    //         FolderResponse folderResponse = new FolderResponse(folderEntity);

    //         List<ItemEntity> children = itemRepository.findByParentId(id);
    //         for (ItemEntity child : children) {
    //             if (child.getType() == ItemType.FOLDER) folderResponse.getChildren().add(buildFolderTree(child.getId()));
    //             else folderResponse.getChildren().add(new ItemResponse(child));
    //         }
    //         return folderResponse;
    //     } catch (Exception e) { return null; }
    // }

    // public FolderResponse getRoot() {
    //     List<ItemEntity> itemEntities = itemRepository.findAll(); // 1 sql query
    //     Map<Long, ItemResponse> itemResponses = new HashMap<>(itemEntities.size());

    //     for (ItemEntity entity : itemEntities) {
    //         Long id = entity.getId();
    //         ItemType type = entity.getType();
    //         UUID publicParentId = itemRepository.findPublicIdById(entity.getParentId());
    //         itemResponses.put(id, type == ItemType.DOCUMENT ? new ItemResponse(entity, publicParentId) : new FolderResponse(entity, publicParentId));
    //     }

    //     FolderResponse rootResponse = null;
    //     for (ItemEntity entity : itemEntities) { // iterate over Entity list again since Responses dont store parentId
    //         Long id = entity.getId();
    //         Long parentId = entity.getParentId();
    //         if (parentId == null) {
    //             rootResponse = (FolderResponse) itemResponses.get(id);
    //             continue;
    //         }
    //         // assuming only folders would be parents
    //         FolderResponse parentResponse = (FolderResponse) itemResponses.get(parentId);
    //         parentResponse.getChildren().add(itemResponses.get(id));
    //     }
    //     return rootResponse;
    // }
}
