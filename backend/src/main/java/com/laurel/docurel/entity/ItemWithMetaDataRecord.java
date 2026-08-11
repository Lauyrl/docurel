package com.laurel.docurel.entity;

import java.time.Instant;

import com.laurel.docurel.enums.PermissionType;

public record ItemWithMetaDataRecord(ItemEntity item, PermissionType permission, Instant lastOpened, boolean starred) {}
