package com.laurel.docurel.model;

public class Document extends DocItem {
    private String contentType;

    public Document(long filesize, String filename){
        super(filesize, filename);
        contentType = getContentTypeFromFilename(filename);
    }

    @Override
    public String getType() { return "doc"; }

    public String getContentType() {
        return contentType;
    }

    public static String getContentTypeFromFilename(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1);
        return switch (extension) {
            case "txt"  -> "text/plain";

            case "jpg"  -> "image/jpeg";
            case "png"  -> "image/png";
            case "gif"  -> "image/gif";
            case "webp" -> "image/webp";

            case "mp4"  -> "video/mp4";
            case "webm" -> "video/webm";

            case "wav"  -> "audio/wav";
            case "mp3"  -> "audio/mp3";

            case "pdf"  -> "application/pdf";
            default     -> "application/octet-stream";
        };
    }
}
