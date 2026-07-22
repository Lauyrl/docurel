package com.laurel.docurel.model;

import java.util.ArrayList;
import java.util.List;

public class Folder extends DocItem {
    private final List<DocItem> children = new ArrayList<>();

    public Folder(String name) {
        super(0, name);
    }

    public List<DocItem> getChildren() {
        return children;
    }
    
    @Override
    public String getType() { return "folder"; }
}
