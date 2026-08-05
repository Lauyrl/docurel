package com.laurel.docurel.enums;

public enum PermissionType {
    VIEWER(0), SHARER(1), EDITOR(2), OWNER(3);

    private final int level;

    PermissionType(int level) {
        this.level = level;
    }

    public static PermissionType max(PermissionType a, PermissionType b) {
        if (a == null) return b;
        if (b == null) return a;
        return (a.level > b.level) ? a : b;
    }
}
