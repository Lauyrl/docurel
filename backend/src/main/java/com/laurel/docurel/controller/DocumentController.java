package com.laurel.docurel.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.laurel.docurel.model.Document;
import com.laurel.docurel.model.Folder;
import com.laurel.docurel.service.DocumentService;

// Controllers should recieve HTTP requests, call a Service, then return a result
@RestController
public class DocumentController {
    private final DocumentService documentService;

    // Spring creates Dependency Beans first, then automatically injects them into the Beans that need them 
    public DocumentController(DocumentService documentService){
        this.documentService = documentService;
    }

    @PostMapping("/document")
    /* @RequestParam: parameter annotation, tells Spring how to find a value
       RequestParam tells Spring that the desired parameter is one of the request's parameters
       Spring finds the form field named "document", and converts the value into a MultipartFile
       MultipartFile: a File that comes from a Multipart request, the File itself isnt Multipart */
    public Document postDocument(@RequestParam(value = "document") MultipartFile document,
                                 @RequestParam(value = "dest") String destDir) {
        return documentService.storeDocument(document, destDir);
    }

    @GetMapping("/document")
    public Folder getDocuments() {
        return documentService.getDocuments();
    }

    /* Service should provide only data to the Controller, if any additional HTTP-related packaging needs to happen, the Controller should handle it
       ResponseEntity: class that provides static factory methods to construct HTTP responses
       Content-Disposition: attachment; filename="{filename}": header that tells the client that the body contains a downloadable file attachment, named "filename" */
    @GetMapping("/document/{filename}/download")
    public ResponseEntity<byte[]> getDocumentDownload(@PathVariable String filename) {
        byte[] file = documentService.getFileBytes(filename);
        if (file != null) {
            return ResponseEntity
                .ok()
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(file);
        } else {
            return ResponseEntity.notFound().build(); 
        }
    }

    @GetMapping("/document/{filename}")
    public ResponseEntity<byte[]> getDocumentPreview(@PathVariable String filename) {
        byte[] file = documentService.getFileBytes(filename);
        if (file != null) {
            return ResponseEntity
                .ok()
                .header("Content-Type", Document.getContentTypeFromFilename(filename))
                .body(file);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/document/{filename}")
    public Folder deleteDocument(@PathVariable String filename) {
        return documentService.deleteDocument(filename);
    }

    @PostMapping("/folder/{foldername}")
    public Folder postFolder(@PathVariable String foldername) {
        return documentService.createDirectory(foldername);
    }

    @DeleteMapping("/folder/{foldername}")
    public Folder deleteFolder(@PathVariable String foldername) {
        return documentService.deleteDirectory(foldername);
    }
}
