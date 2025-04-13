package com.fourj.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String auth0Id;
    private String email;
    private String fullName;
    private String phone;
    private String fullAddress;
    private LocalDate dateOfBirth;
    private String gender;
    private String avatarUrl;
    private String biography;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}