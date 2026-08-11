package com.laurel.docurel.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.laurel.docurel.dto.request.DeletePermissionRequest;
import com.laurel.docurel.dto.request.SetPermissionsRequest;
import com.laurel.docurel.dto.request.UpdateItemRequest;
import com.laurel.docurel.dto.response.ItemResponse;
import com.laurel.docurel.dto.response.UsersPermissionsForItemResponse;
import com.laurel.docurel.enums.PermissionType;
import com.laurel.docurel.exception.InvalidPermissionsException;
import com.laurel.docurel.service.ItemService;

import lombok.RequiredArgsConstructor;

@RestController // Controllers should recieve HTTP requests, call a Service, then return a result
@RequiredArgsConstructor // Automatically defines a constructor that sets private final fields
public class ItemController {
    // Spring creates Dependency Beans first, then automatically injects them into the Beans that need them
    private final ItemService itemService;

    @GetMapping("/document")
    public List<ItemResponse> getDocuments() {
        return itemService.getOwnedItems();
    }
    
    @PostMapping("/document")
    /* @RequestParam: parameter annotation, tells Spring how to find a value
       RequestParam tells Spring that the desired parameter is one of the request's parameters
       Spring finds the form field named "document", and converts the value into a MultipartFile
       MultipartFile: a File that comes from a Multipart request, the File itself isnt Multipart */
    public ItemResponse postDocument(@RequestParam(value = "document") MultipartFile document,
                                     @RequestParam(value = "publicParentId") UUID publicParentId) throws IOException, InvalidPermissionsException {
        return itemService.storeDocument(document, publicParentId);
    }

    /* Service should provide only data to the Controller, if any additional HTTP-related packaging needs to happen, the Controller should handle it
       ResponseEntity: class that provides static factory methods to construct HTTP responses
       Content-Disposition: attachment; filename="{filename}": header that tells the client that the body contains a downloadable file attachment, named "filename" */
    @GetMapping("/document/{publicId}/download")
    public ResponseEntity<byte[]> getDocumentDownload(@PathVariable UUID publicId) throws IOException, InvalidPermissionsException {
        byte[] file = itemService.getFileBytes(publicId);
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=\"" + itemService.getItemName(publicId) + "\"")
            .body(file);
    }

    @GetMapping("/document/{publicId}")
    public ResponseEntity<byte[]> getDocumentPreview(@PathVariable UUID publicId) throws IOException, InvalidPermissionsException {
        byte[] file = itemService.getFileBytes(publicId);
        return ResponseEntity
            .ok()
            .header("Content-Type", itemService.getItemContentType(publicId))
            .body(file);
    }

    @DeleteMapping("/document/{publicId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID publicId) throws IOException, InvalidPermissionsException {
        itemService.deleteDocument(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/folder")
    public ItemResponse postFolder(@RequestParam(value = "foldername") String foldername,
                                   @RequestParam(value = "publicParentId") UUID publicParentId) throws InvalidPermissionsException {
        return itemService.createDirectory(foldername, publicParentId);
    }

    // @GetMapping("/folder/root")
    // public ItemResponse getUserRoot() {
    //     return itemService.getUserRoot();
    // }

    @DeleteMapping("/folder/{publicId}")
    public ResponseEntity<Void> deleteFolder(@PathVariable UUID publicId) throws IOException, InvalidPermissionsException {
        itemService.deleteDirectory(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/item/{publicId}")
    public ResponseEntity<Void> patchItem(@PathVariable UUID publicId,
                                          @RequestBody UpdateItemRequest request) throws InvalidPermissionsException {
        itemService.updateItem(publicId, request.getName(), request.getPublicParentId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/item/{publicId}/permission")
    public UsersPermissionsForItemResponse setUserPermissionsForItem(@PathVariable UUID publicId, @RequestBody SetPermissionsRequest request) throws InvalidPermissionsException {
        return itemService.setUserPermissionsForItem(request.getUsernameOrEmail(), publicId, PermissionType.valueOf(request.getPermissionString()));
    }

    @GetMapping("/item/{publicId}/permission")
    public List<UsersPermissionsForItemResponse> getUsersWithPermissionsForItem(@PathVariable UUID publicId) throws InvalidPermissionsException {
        return itemService.getUsersWithPermissionsForItem(publicId);
    }

    @DeleteMapping("/item/{itemPublicId}/permission")
    public ResponseEntity<Void> deleteUserPermissionForItem(@PathVariable UUID itemPublicId, @RequestBody DeletePermissionRequest request) throws InvalidPermissionsException {
        itemService.deleteUserPermissionForItem(itemPublicId, request.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/item/search")
    public List<UUID> searchItems(
        @RequestParam(required = true) boolean ownedOnly,
        @RequestParam(required = true) boolean excludeOwned,
        @RequestParam(required = false) String query,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String contentType,
        @RequestParam(required = false) Instant createdAfter,
        @RequestParam(required = false) Instant createdBefore,
        @RequestParam(required = false) Instant updatedAfter,
        @RequestParam(required = false) Instant updatedBefore,
        @RequestParam(required = true) String sortBy,
        @RequestParam(required = true) boolean descending
    ) {
        return itemService.searchItems(
            ownedOnly,
            excludeOwned,
            query,
            type,
            contentType,
            createdAfter,
            createdBefore,
            updatedAfter,
            updatedBefore,
            sortBy, 
            descending
        );
    }

    @PostMapping("/item/{publicId}/open")
    public ResponseEntity<Void> open(@PathVariable UUID publicId) throws InvalidPermissionsException {
        itemService.open(publicId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/shared")
    public List<ItemResponse> getItemsSharedWithCurrentUser() {
        return itemService.getItemsUserCanAccessExceptOwned();
    }

    @GetMapping("/recents")
    public List<ItemResponse> getRecents() {
        return itemService.getRecents();
    }
}
