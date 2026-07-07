package com.hrmanagement.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleBadRequest_returns400() {
        ResponseEntity<Map<String, String>> result = handler.handleBadRequest(new BadRequestException("Bad input"));

        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
        assertEquals("Bad input", result.getBody().get("message"));
    }

    @Test
    void handleNotFound_returns404() {
        ResponseEntity<Map<String, String>> result = handler.handleNotFound(new NotFoundException("Not found"));

        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
        assertEquals("Not found", result.getBody().get("message"));
    }

    @Test
    void handleConflict_returns409() {
        ResponseEntity<Map<String, String>> result = handler.handleConflict(new ConflictException("Duplicate"));

        assertEquals(HttpStatus.CONFLICT, result.getStatusCode());
        assertEquals("Duplicate", result.getBody().get("message"));
    }

    @Test
    void handleUnauthorized_returns401() {
        ResponseEntity<Map<String, String>> result = handler.handleUnauthorized(new UnauthorizedException("Unauthorized"));

        assertEquals(HttpStatus.UNAUTHORIZED, result.getStatusCode());
        assertEquals("Unauthorized", result.getBody().get("message"));
    }
}
