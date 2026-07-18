package com.laurel.docurel.model;

public class Document {
    private long filesize; 
    private String filename;
    private String contentType;

    public Document(long filesize, String filename){
        this.filesize = filesize;
        this.filename = filename;
        this.contentType = giveContentType(filename);
    }

    public String getFilename() {
        return filename;
    }

    public long getFilesize() {
        return filesize;
    }

    public String getContentType() {
        return contentType;
    }

    public static String giveContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1);
        return switch (extension) {
            case "txt"  -> "text/plain";

            case "jpg"  -> "image/jpeg";
            case "png"  -> "image/png";
            case "gif"  -> "image/gif";
            case "webp" -> "image/webp";

            case "mp4"  -> "image/mp4";
            case "webm" -> "image/webm";

            case "wav"  -> "audio/wav";
            case "mp3"  -> "audio/mp3";

            case "pdf"  -> "application/pdf";
            default     -> "application/octet-stream";
        };
    }
}
