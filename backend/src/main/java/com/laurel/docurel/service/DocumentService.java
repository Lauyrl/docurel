package com.laurel.docurel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.laurel.docurel.model.Document;
import com.laurel.docurel.model.Folder;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

@Service
public class DocumentService {
    public static Folder scrapeDirectory(Path loc) {
        Folder root = new Folder(loc.getFileName().toString());
        try (DirectoryStream<Path> dirstream = Files.newDirectoryStream(loc)) {
            for (Path path : dirstream) {
                if (Files.isRegularFile(path)) {
                    Document document = new Document(Files.size(path), path.getFileName().toString());
                    root.getChildren().add(document);
                }
                else if (Files.isDirectory(path)) {
                    Folder folder = scrapeDirectory(path);
                    root.getChildren().add(folder);
                }
            } 
            root.getChildren().sort(Comparator.comparing(item -> !item.getType().equals("folder")));
            return root;
        } catch (IOException e) { return new Folder(""); }
    }

    public Folder getDocuments() {
        Path loc = Path.of("C:\\CS\\docurel\\testUploads");
        return scrapeDirectory(loc);
    }

    public Document storeDocument(MultipartFile document) {
        try {
            String filename = document.getOriginalFilename();
            if (filename == null) {throw new IOException();}

            Path dest = Path.of("C:\\CS\\docurel\\testUploads", filename);
            if (Files.exists(dest)) return null;
            document.transferTo(dest);

            return new Document(document.getSize(), document.getOriginalFilename());
        } catch (IOException e) { return null; }
    }

    public byte[] getFileBytes(String filename) {
        Path loc = Path.of("C:\\CS\\docurel\\testUploads\\" + filename);
        try {
            return Files.readAllBytes(loc);
        } catch (IOException e) {return null;} 
    }

    public Folder deleteDocument(String filename) {
        Path loc = Path.of("C:\\CS\\docurel\\testUploads\\" + filename);
        try {
            Files.delete(loc);
        } catch (IOException e) {} 
        return getDocuments();
    }

    public Folder createDirectory(String foldername) {
        Path loc = Path.of("C:\\CS\\docurel\\testUploads\\" + foldername);
        try {
            Files.createDirectory(loc);
            return new Folder(foldername);
        } catch (IOException e) { return null; }
    }
}
