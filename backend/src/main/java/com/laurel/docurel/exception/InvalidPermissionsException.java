package com.laurel.docurel.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class InvalidPermissionsException extends IllegalAccessException {
    public InvalidPermissionsException(String msg) {
        super(msg);
    }
}
