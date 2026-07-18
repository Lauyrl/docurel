package com.laurel.docurel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laurel.docurel.model.Document;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentService {

    public List<Document> getDocuments() {
        List<Document> documents = new ArrayList<Document>();

        Path loc = Path.of("C:\\CS\\docurel\\testUploads");
        try (DirectoryStream<Path> dirstream = Files.newDirectoryStream(loc)) {
            for (Path path : dirstream) {
                Document document = new Document(Files.size(path), path.getFileName().toString());
                documents.add(document);
            }
            return documents;
        } catch (IOException e) { return new ArrayList<Document>(); }
    }

    public byte[] getFileBytes(String filename) {
        Path loc = Path.of("C:\\CS\\docurel\\testUploads\\" + filename);
        try {
            return Files.readAllBytes(loc);
        } catch (IOException e) {return null;} 
    }

    public List<Document> deleteDocument(String filename) {
        Path loc = Path.of("C:\\CS\\docurel\\testUploads\\" + filename);
        try {
            Files.delete(loc);
        } catch (IOException e) {} 
        return getDocuments();
    }

    public Document storeDocument(MultipartFile document) {
        try {
            String filename = document.getOriginalFilename();
            if (filename == null) {throw new IOException();}

            Path dest = Path.of("C:\\CS\\docurel\\testUploads", filename);
            if (Files.exists(dest)) return null;
            document.transferTo(dest);

            return new Document(document.getSize(), document.getOriginalFilename());
        } catch (IOException e) {
            return null;
        }
    }
}
