package com.hrmanagement.auth.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;

    @Email(message = "Invalid email format")
    private String email;
}
