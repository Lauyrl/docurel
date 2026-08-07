package com.laurel.docurel.enums;

import java.util.List;

public enum PermissionType {
    NO_PERMISSION(-1), VIEWER(0), SHARER(1), EDITOR(2), OWNER(3);

    private final int level;

    PermissionType(int level) {
        this.level = level;
    }

    public boolean greaterThanOrEqualTo(PermissionType that) {
        return that == null || this.level >= that.level;
    }

    public static boolean greaterThanOrEqualTo(PermissionType a, PermissionType b) {
        if (a == null && b == null) return true;
        if (a == null) return false; // null is greater than nothing
        if (b == null) return true;  // everything is greater than null
        return a.level >= b.level;
    }


    public static PermissionType max(PermissionType a, PermissionType b) {
        if (a == null) return b;
        if (b == null) return a;
        return (a.level > b.level) ? a : b;
    }

    public static PermissionType max(List<PermissionType> permissions) {
        if (permissions == null || permissions.isEmpty()) return null;
        PermissionType maxPermission = null;
        for (PermissionType permission : permissions) {
            maxPermission = PermissionType.max(maxPermission, permission);
        }
        return maxPermission;
    }
}
