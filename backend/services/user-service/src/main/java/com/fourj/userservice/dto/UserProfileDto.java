package com.fourj.userservice.dto;

import com.fourj.userservice.model.UserProfile.VerificationStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Getter
@Setter
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
    private List<String> permissions;
    // Thông tin seller
    private boolean seller;
    private String storeName;
    private String taxId;
    private String businessAddress;
    private VerificationStatus verificationStatus;
    private LocalDateTime verificationDate;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}