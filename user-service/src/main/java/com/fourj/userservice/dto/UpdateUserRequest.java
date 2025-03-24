package com.fourj.userservice.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Email(message = "Email should be valid")
    private String email;
    private String fullName;
    private String phoneNumber;
}
