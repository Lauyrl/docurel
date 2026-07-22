package com.laurel.docurel.model;

public abstract class DocItem {
    private long size; 
    private String name;

    public DocItem(long filesize, String filename){
        this.size = filesize;
        this.name = filename;
    }

    public String getName() {
        return name;
    }

    public long getSize() {
        return size;
    }

    // 'Jackson' serializes information into JSON based entirely on getters and their return value, a corresponding field is not required
    public abstract String getType();
}
