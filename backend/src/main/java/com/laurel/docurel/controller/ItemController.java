package com.laurel.docurel.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.laurel.docurel.dto.ItemResponse;
import com.laurel.docurel.dto.UpdateItemRequest;
import com.laurel.docurel.service.ItemService;

// Controllers should recieve HTTP requests, call a Service, then return a result
@RestController
public class ItemController {
    private final ItemService itemService;

    // Spring creates Dependency Beans first, then automatically injects them into the Beans that need them 
    public ItemController(ItemService itemService){
        this.itemService = itemService;
    }

    @GetMapping("/document")
    public List<ItemResponse> getDocuments() {
        return itemService.getDocuments();
    }
    
    @PostMapping("/document")
    /* @RequestParam: parameter annotation, tells Spring how to find a value
       RequestParam tells Spring that the desired parameter is one of the request's parameters
       Spring finds the form field named "document", and converts the value into a MultipartFile
       MultipartFile: a File that comes from a Multipart request, the File itself isnt Multipart */
    public ItemResponse postDocument(@RequestParam(value = "document") MultipartFile document,
                                     @RequestParam(value = "publicParentId") UUID publicParentId) throws IOException {
        return itemService.storeDocument(document, publicParentId);
    }

    /* Service should provide only data to the Controller, if any additional HTTP-related packaging needs to happen, the Controller should handle it
       ResponseEntity: class that provides static factory methods to construct HTTP responses
       Content-Disposition: attachment; filename="{filename}": header that tells the client that the body contains a downloadable file attachment, named "filename" */
    @GetMapping("/document/{publicId}/download")
    public ResponseEntity<byte[]> getDocumentDownload(@PathVariable UUID publicId) throws IOException {
        byte[] file = itemService.getFileBytes(publicId);
        return ResponseEntity
            .ok()
            .header("Content-Disposition", "attachment; filename=\"" + itemService.getItemName(publicId) + "\"")
            .body(file);
    }

    @GetMapping("/document/{publicId}")
    public ResponseEntity<byte[]> getDocumentPreview(@PathVariable UUID publicId) throws IOException {
        byte[] file = itemService.getFileBytes(publicId);
        return ResponseEntity
            .ok()
            .header("Content-Type", itemService.getItemContentType(publicId))
            .body(file);
    }

    @DeleteMapping("/document/{publicId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID publicId) throws IOException {
        itemService.deleteDocument(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/folder")
    public ItemResponse postFolder(@RequestParam(value = "foldername") String foldername,
                                   @RequestParam(value = "publicParentId") UUID publicParentId) {
        return itemService.createDirectory(foldername, publicParentId);
    }

    @DeleteMapping("/folder/{publicId}")
    public ResponseEntity<Void> deleteFolder(@PathVariable UUID publicId) throws IOException {
        itemService.deleteDirectory(publicId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/item/{publicId}")
    public ResponseEntity<Void> patchItem(@PathVariable UUID publicId,
                                          @RequestBody UpdateItemRequest request) {
        itemService.updateItem(publicId, request.getName(), request.getPublicParentId());
        return ResponseEntity.noContent().build();
    }
}
