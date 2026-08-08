package com.laurel.docurel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laurel.docurel.dto.response.ItemResponse;
import com.laurel.docurel.dto.response.UsersPermissionsForItemResponse;
import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.entity.UserItemEntity;
import com.laurel.docurel.enums.ItemType;
import com.laurel.docurel.enums.PermissionType;
import com.laurel.docurel.exception.InvalidPermissionsException;
import com.laurel.docurel.repository.ItemRepository;
import com.laurel.docurel.repository.UserItemRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {
    private static final String STORAGE_PATH = "C:\\CS\\docurel\\storage\\";
    private static final Long GLOBAL_ROOT_ID = 0L;

    private final ItemRepository itemRepository;
    private final UserItemRepository userItemRepository; // services can cross-call repositories
    private final UserService userService;

    public List<ItemResponse> getDocumentsExceptUserRoot() { // specifically for owned items in My Files
        List<ItemEntity> entities = userItemRepository.findItemsByUser(userService.getCurrentUserEntity());

        List<ItemResponse> responses = new ArrayList<>();
        for (ItemEntity entity : entities) {
            if (entity.getParentId() == GLOBAL_ROOT_ID) continue; // skip user root
            responses.add(new ItemResponse(entity, itemRepository.findPublicIdById(entity.getParentId()), PermissionType.OWNER));
        }
        return responses;
    }

    public ItemResponse getUserRoot() {
        ItemEntity userRootItem = userItemRepository.findUserRootItemByUser(userService.getCurrentUserEntity(), GLOBAL_ROOT_ID).orElseThrow();
        // abstract the global root by setting the user root's parentId as null
        return new ItemResponse(userRootItem, null, PermissionType.OWNER);
    }

    @SuppressWarnings("null")
    public ItemResponse storeDocument(MultipartFile document, UUID publicParentId) throws IOException, InvalidPermissionsException {
        validateModifyFolderContents(publicParentId);

        Long parentId = itemRepository.findIdByPublicId(publicParentId);
        String filename = Objects.requireNonNull(document.getOriginalFilename());
        
        if (itemRepository.existsByParentIdAndName(parentId, filename))  {
            throw new IllegalArgumentException("An item with that name already exists in that location");
        }
        ItemEntity item = new ItemEntity(filename, parentId, ItemType.DOCUMENT, document.getSize());
        itemRepository.save(item);

        UserEntity uploader = userService.getCurrentUserEntity();
        // any folder added to this directory before would have been uploaded into the owner's root folder, of a folder whose parent is the root folder,
        // therefore the owner of any folder being uploaded into would be the owner of the entire tree
        UserEntity directoryOwner = findOwnerByItemPublicId(publicParentId).orElseThrow(); 
        PermissionType uploadersPermission = PermissionType.OWNER;
        if (!uploader.getId().equals(directoryOwner.getId())) {
            userItemRepository.save(new UserItemEntity(uploader, item, PermissionType.EDITOR));
            uploadersPermission = PermissionType.EDITOR;
        } 
        userItemRepository.save(new UserItemEntity(directoryOwner, item, PermissionType.OWNER));

        Path dest = Path.of(STORAGE_PATH, item.getId().toString());            
        document.transferTo(dest);

        return new ItemResponse(item, publicParentId, uploadersPermission);
    }

    public byte[] getFileBytes(UUID publicId) throws IOException, InvalidPermissionsException {
        validateViewing(publicId);

        Long id = itemRepository.findIdByPublicId(publicId);
        Path loc = Path.of(STORAGE_PATH, id.toString());
        return Files.readAllBytes(loc); 
    }

    public void deleteDocument(UUID publicId) throws IOException, InvalidPermissionsException {
        validateModifyFolderContents(itemRepository.findPublicParentIdByPublicId(publicId));

        Long id = itemRepository.findIdByPublicId(publicId);
        Path loc = Path.of(STORAGE_PATH, id.toString());
        itemRepository.deleteById(id);
        Files.delete(loc);
    }

    // only create a logical Folder entry on the DB
    public ItemResponse createDirectory(String foldername, UUID publicParentId) throws InvalidPermissionsException {
        validateModifyFolderContents(publicParentId);

        Long parentId = itemRepository.findIdByPublicId(publicParentId);
        if (itemRepository.existsByParentIdAndName(parentId, foldername))  {
            throw new IllegalArgumentException("An item with that name already exists in that location");
        }

        ItemEntity folder = itemRepository.save(new ItemEntity(foldername, parentId, ItemType.FOLDER, null));

        UserEntity uploader = userService.getCurrentUserEntity();
        UserEntity directoryOwner = findOwnerByItemPublicId(publicParentId).orElseThrow(); 
        PermissionType uploadersPermission = PermissionType.OWNER;
        if (!uploader.getId().equals(directoryOwner.getId())) {
            userItemRepository.save(new UserItemEntity(uploader, folder, PermissionType.EDITOR));
            uploadersPermission = PermissionType.EDITOR;
        } 
        userItemRepository.save(new UserItemEntity(directoryOwner, folder, PermissionType.OWNER));
        return new ItemResponse(folder, publicParentId, uploadersPermission);
    }

    @SuppressWarnings("null")
    public void deleteDirectory(UUID publicId) throws IOException, InvalidPermissionsException {
        validateModifyFolderContents(itemRepository.findPublicParentIdByPublicId(publicId));

        Long rootId = itemRepository.findIdByPublicId(publicId);
        List<Long> toDeleteIds = itemRepository.findDocumentIdsByAncestorId(rootId);
        for (Long id : toDeleteIds) {
            Path loc = Path.of(STORAGE_PATH, id.toString());
            Files.delete(loc);
        }
        itemRepository.deleteById(rootId); // user_items already has ON DELETE CASCADE
    }

    @SuppressWarnings("null")
    public void updateItem(UUID publicId, String newName, UUID newPublicParentId) throws InvalidPermissionsException {        
        ItemEntity entityToUpdate = itemRepository.findByPublicId(publicId).orElseThrow();
        UUID currentParentPublicId = itemRepository.findPublicParentIdByPublicId(publicId);
        if (newName != null) {
            validateModifyFolderContents(currentParentPublicId);
            entityToUpdate.setName(newName);
        }
        if (newPublicParentId != null) {
            validateOwnership(publicId);                          // must own an item to move it away
            validateModifyFolderContents(currentParentPublicId);  // can 'delete' item from original folder
            validateModifyFolderContents(newPublicParentId);      // can 'upload' item into new folder

            ItemEntity newParent = itemRepository.findByPublicId(newPublicParentId).orElseThrow();

            if (itemRepository.existsByParentIdAndName(newParent.getId(), entityToUpdate.getName()))  {
                throw new IllegalArgumentException("An item with that name already exists in that location");
            }

            Long entityId    = entityToUpdate.getId();
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

            UserEntity oldOwner = userService.getCurrentUserEntity();
            UserEntity newOwner = findOwnerByItemPublicId(newPublicParentId).orElseThrow();
            if (!oldOwner.getId().equals(newOwner.getId())) {
                List<ItemEntity> selfAndDescendants = itemRepository.findSelfAndDescendants(publicId);
                for (ItemEntity i : selfAndDescendants) { 
                    UserItemEntity oldOwnerPermissions = userItemRepository.findByUserAndItem(oldOwner, i).orElseThrow();
                    oldOwnerPermissions.setPermission(PermissionType.EDITOR);

                    UserItemEntity newOwnerPermissions = userItemRepository.findByUserAndItem(newOwner, i).orElse(new UserItemEntity(newOwner, i, PermissionType.OWNER));
                    newOwnerPermissions.setPermission(PermissionType.OWNER);

                    userItemRepository.save(oldOwnerPermissions);
                    userItemRepository.save(newOwnerPermissions);
                }
            }
        } 
        itemRepository.save(entityToUpdate);
    }

    public UsersPermissionsForItemResponse setUserPermissionsForItem(String usernameOrEmail, UUID itemPublicId, PermissionType permission) throws InvalidPermissionsException {
        validateOwnership(itemPublicId);

        UserEntity user = userService.getUserByUsernameOrEmail(usernameOrEmail);
        ItemEntity item = itemRepository.findByPublicId(itemPublicId).orElseThrow();

        if (user.getId().equals(userService.getCurrentUserEntity().getId())) return null; // avoid setting permissions for self

        UserItemEntity userItem = userItemRepository
            .findByUserAndItem(user, item)
            .orElse(new UserItemEntity(user, item, permission));
        userItem.setPermission(permission);
        userItemRepository.save(userItem);

        return new UsersPermissionsForItemResponse(user.getUsername(), permission);
    }

    public List<UsersPermissionsForItemResponse> getUsersWithPermissionsForItem(UUID publicId) throws InvalidPermissionsException {
        validateOwnership(publicId);

        List<ItemEntity> itemsOnPath = itemRepository.findItemsOnPath(publicId);
        
        List<UserItemEntity> userItemEntities = userItemRepository.findByItems(itemsOnPath);
        Map<Long, List<UserItemEntity>> permissionMap = new HashMap<>();
        for (UserItemEntity ui : userItemEntities) {
            permissionMap.computeIfAbsent(ui.getItem().getId(), e -> new ArrayList<UserItemEntity>()).add(ui);
        }

        Map<Long, UsersPermissionsForItemResponse> userFirstPermissionResponses = new HashMap<>();
        for (ItemEntity item : itemsOnPath) {
            List<UserItemEntity> usersWithPermissions = permissionMap.getOrDefault(item.getId(), Collections.emptyList());
            for (UserItemEntity ui : usersWithPermissions) {
                userFirstPermissionResponses.putIfAbsent(ui.getUser().getId(), new UsersPermissionsForItemResponse(ui.getUser().getUsername(), ui.getPermission()));
            }
        }

        List<UsersPermissionsForItemResponse> responses = new ArrayList<>();

        for (UsersPermissionsForItemResponse response : userFirstPermissionResponses.values()) {
            if (response.getPermission() != PermissionType.NO_PERMISSION) {
                responses.add(response);
            }
        }

        return responses;
    }

    public void deleteUserPermissionForItem(UUID itemPublicId, String username) throws InvalidPermissionsException {
        validateOwnership(itemPublicId);

        UserEntity user = userService.getUserByUsernameOrEmail(username);
        ItemEntity item = itemRepository.findByPublicId(itemPublicId).orElseThrow();
        
        List<ItemEntity> selfAndDescendants = itemRepository.findSelfAndDescendants(itemPublicId);
        userItemRepository.deleteByUserAndItems(user, selfAndDescendants);

        // to block items from inheriting permissions after old permissions were revoked
        userItemRepository.save(new UserItemEntity(user, item, PermissionType.NO_PERMISSION));
    }

    /**
     * Firstly, build a map of all accessible items for the current user, 
     * and a map of all items with explicit UserItem permission entries.
     * 
     * For each accessible item, walk up to the highest accessible ancestor, 
     * storing the highest-level, explicit (not implicitly through inheritence) 
     * permission along the path.
     * 
     * @return A list of accessible items paired with their explicitly defined, or inherited, permissions, and their publicParentId
     */
    public List<ItemResponse> getItemsUserCanAccessExceptOwned() {
        UserEntity currentUser = userService.getCurrentUserEntity();

        List<ItemEntity> accessibleItems = userItemRepository.findAccessibleItemsExceptOwnedByUserId(currentUser.getId()); 
        Map<Long, ItemEntity> accessibleItemsMap = new HashMap<>();
        for (ItemEntity item : accessibleItems) {
            accessibleItemsMap.put(item.getId(), item);
        }

        List<UserItemEntity> explicitPermissions = userItemRepository.findByUserExceptOwned(currentUser.getId()); // include NO_PERMISSIONS to block walk ups
        Map<Long, PermissionType> explicitPermissionsMap = new HashMap<>();
        for (UserItemEntity ui : explicitPermissions) {
            explicitPermissionsMap.put(ui.getItem().getId(), ui.getPermission());
        }

        List<ItemResponse> sharedItemResponses = new ArrayList<>();
        for (ItemEntity item : accessibleItems) {
            PermissionType firstPermission = explicitPermissionsMap.get(item.getId());
            ItemEntity accessibleAncestor = accessibleItemsMap.get(item.getParentId());

            while (accessibleAncestor != null && firstPermission == null) { // stop at the last accessible ancestor (until an ancestor that isn't "shared"), who holds the root permission
                firstPermission = explicitPermissionsMap.get(accessibleAncestor.getId());
                accessibleAncestor = accessibleItemsMap.get(accessibleAncestor.getParentId());
            }

            if (!PermissionType.greaterThanOrEqualTo(firstPermission, PermissionType.VIEWER)) continue;

            ItemEntity accessibleParent = accessibleItemsMap.get(item.getParentId());
            // needed to build ItemResponse inside SharedItemResponse 
            // if the parent is not shared/accessible to the current user, abstract its' publicId as null
            UUID publicParentId = accessibleParent != null ? accessibleParent.getPublicId() : null;
            sharedItemResponses.add(new ItemResponse(item, publicParentId, firstPermission));
        }
        return sharedItemResponses;
    }

    public List<UUID> searchItems(String query) {
        return itemRepository.findMatchingItemsPublicId(
            userService.getCurrentUserEntity().getId(), 
            query
        );
    }
    
//-----validation
    public void validateModifyFolderContents(UUID publicParentId) throws InvalidPermissionsException { 
        if (!PermissionType.greaterThanOrEqualTo(getEffectivePermissionLevel(publicParentId), PermissionType.EDITOR)) {
            throw new InvalidPermissionsException("You cannot change the contents of the current folder.");
        }
    }

    // public void validateRename(UUID publicId) throws InvalidPermissionsException {
    //     if (!PermissionType.greaterThanOrEqualTo(getEffectivePermissionLevel(publicId), PermissionType.EDITOR)) {
    //         throw new InvalidPermissionsException("You cannot rename this item.");
    //     }
    // }

    public void validateViewing(UUID publicId) throws InvalidPermissionsException {
        if (!PermissionType.greaterThanOrEqualTo(getEffectivePermissionLevel(publicId), PermissionType.VIEWER)) {
            throw new InvalidPermissionsException("You don't have access to this item.");
        }
    }

    public void validateOwnership(UUID publicId) throws InvalidPermissionsException {
        InvalidPermissionsException e = new InvalidPermissionsException("You can't access permissions for this item");
        if (userItemRepository.findByUserAndItem(userService.getCurrentUserEntity(), itemRepository.findByPublicId(publicId).orElseThrow())
            .orElseThrow(() -> e).getPermission() != PermissionType.OWNER) throw e;    
    }

//-----helpers
    public String getItemName(UUID publicId) {
        return itemRepository.findNameByPublicId(publicId);
    }

    public String getItemContentType(UUID publicId) {
        return itemRepository.findContentTypeByPublicId(publicId);
    }

    public UUID getItemPublicId(Long id) {
        return itemRepository.findPublicIdById(id);
    }

    public PermissionType getEffectivePermissionLevel(UUID publicId) {
        return itemRepository.findFirstPermissionOnPath(itemRepository.findIdByPublicId(publicId), userService.getCurrentUserEntity().getId());
    }

    public Optional<UserEntity> findOwnerByItemPublicId(UUID publicId) {
        return userItemRepository.findByItemPublicIdAndPermission(publicId, PermissionType.OWNER);
    }

    // public List<ItemResponse> searchItems(String query) {
    //     List<ItemEntity> results = itemRepository.findMatchingItems(
    //         userService.getCurrentUserEntity().getId(), 
    //         query
    //     );
    //     List<ItemResponse> responses = new ArrayList<>();
    //     for (ItemEntity i : results) responses.add(new ItemResponse(i, itemRepository.findPublicIdById(i.getParentId())));
    //     return responses;
    // }

    // public PermissionType getEffectivePermissionLevel(UUID publicId) {
    //     List<ItemEntity> itemsOnPath = itemRepository.findItemsOnPath(publicId);
    //     if (itemsOnPath.isEmpty()) return null;
    //     List<PermissionType> permissionsOnPath = userItemRepository.findPermissionsByItemsAndUser(itemsOnPath, userService.getCurrentUserEntity());
    //     return PermissionType.max(permissionsOnPath);
    // }

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

    // /**
    //  * Firstly, build a map of all accessible items for the current user, 
    //  * and a map of all items with explicit UserItem permission entries.
    //  * 
    //  * For each accessible item, walk up to the highest accessible ancestor, 
    //  * storing the highest-level, explicit (not implicitly through inheritence) 
    //  * permission along the path.
    //  * 
    //  * @return A list of accessible items paired with their explicitly defined, or inherited, permissions, and their publicParentId
    //  */
    // public List<SharedItemResponse> getItemsUserCanAccessExceptOwned() {
    //     UserEntity currentUser = userService.getCurrentUserEntity();

    //     List<ItemEntity> sharedItems = userItemRepository.findAccessibleItemsExceptOwnedByUserId(currentUser.getId());
    //     Map<Long, ItemEntity> sharedItemsMap = new HashMap<>();
    //     for (ItemEntity item : sharedItems) {
    //         sharedItemsMap.put(item.getId(), item);
    //     }

    //     List<UserItemEntity> explicitPermissions = userItemRepository.findByUserExceptOwned(currentUser.getId());
    //     Map<Long, PermissionType> explicitPermissionsMap = new HashMap<>();
    //     for (UserItemEntity ui : explicitPermissions) {
    //         explicitPermissionsMap.put(ui.getItem().getId(), ui.getPermission());
    //     }

    //     List<SharedItemResponse> sharedItemResponses = new ArrayList<>();
    //     for (ItemEntity item : sharedItems) {
    //         PermissionType maxPermission = explicitPermissionsMap.get(item.getId());
    //         ItemEntity sharedAncestor = sharedItemsMap.get(item.getParentId());

    //         while (sharedAncestor != null) { // stop at the last accessible ancestor (until an ancestor that isn't "shared"), who holds the root permission
    //             maxPermission = PermissionType.max(maxPermission, explicitPermissionsMap.get(sharedAncestor.getId()));
    //             sharedAncestor = sharedItemsMap.get(sharedAncestor.getParentId());
    //         }

    //         ItemEntity sharedParent = sharedItemsMap.get(item.getParentId());
    //         // needed to build ItemResponse inside SharedItemResponse 
    //         // if the parent is not shared/accessible to the current user, abstract its' publicId as null
    //         UUID publicParentId = sharedParent != null ? sharedParent.getPublicId() : null;
    //         sharedItemResponses.add(new SharedItemResponse(item, publicParentId, maxPermission));
    //     }
    //     return sharedItemResponses;
    // }
}
