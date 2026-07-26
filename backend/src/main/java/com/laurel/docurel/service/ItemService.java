package com.laurel.docurel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laurel.docurel.dto.FolderResponse;
import com.laurel.docurel.dto.ItemResponse;
import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.enums.ItemType;
import com.laurel.docurel.repository.ItemRepository;

import jakarta.transaction.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class ItemService {
    private static final String STORAGE_PATH = "C:\\CS\\docurel\\storage\\";

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public FolderResponse getRoot() {
        List<ItemEntity> itemEntities = itemRepository.findAll(); // 1 sql query
        Map<Long, ItemResponse> itemResponses = new HashMap<>(itemEntities.size());

        for (ItemEntity entity : itemEntities) {
            Long id = entity.getId();
            ItemType type = entity.getType();
            UUID publicParentId = itemRepository.findPublicIdById(entity.getParentId());
            itemResponses.put(id, type == ItemType.DOCUMENT ? new ItemResponse(entity, publicParentId) : new FolderResponse(entity, publicParentId));
        }

        FolderResponse rootResponse = null;
        for (ItemEntity entity : itemEntities) { // iterate over Entity list again since Responses dont store parentId
            Long id = entity.getId();
            Long parentId = entity.getParentId();
            if (parentId == null) {
                rootResponse = (FolderResponse) itemResponses.get(id);
                continue;
            }
            // assuming only folders would be parents
            FolderResponse parentResponse = (FolderResponse) itemResponses.get(parentId);
            parentResponse.getChildren().add(itemResponses.get(id));
        }
        return rootResponse;
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

    public FolderResponse deleteDocument(UUID publicId) throws IOException {
        Long id = itemRepository.findIdByPublicId(publicId);
        Path loc = Path.of(STORAGE_PATH, id.toString());
        Files.delete(loc);

        itemRepository.deleteById(id); 
        return getRoot();
    }

    // only create a logical Folder entry on the DB
    public FolderResponse createDirectory(String foldername, UUID publicParentId) {
        Long parentId = itemRepository.findIdByPublicId(publicParentId);
        if (itemRepository.existsByParentIdAndName(parentId, foldername))  {
            throw new IllegalArgumentException("An item with that name already exists in that location");
        }

        ItemEntity folderEntity = itemRepository.save(new ItemEntity(foldername, parentId, ItemType.FOLDER, null));
        return new FolderResponse(folderEntity, itemRepository.findPublicIdById(parentId));
    }

    @SuppressWarnings("null")
    public FolderResponse deleteDirectory(UUID publicId) throws IOException {
        Long rootId = itemRepository.findIdByPublicId(publicId);
        List<Long> toDeleteIds = itemRepository.findDocumentIdsByTree(rootId);
        for (Long id : toDeleteIds) {
            Path loc = Path.of(STORAGE_PATH, id.toString());
            Files.delete(loc);
        }
        itemRepository.deleteById(rootId);
        return getRoot();
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
}
