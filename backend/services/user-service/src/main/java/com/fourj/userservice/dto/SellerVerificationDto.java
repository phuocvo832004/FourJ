package com.fourj.userservice.dto;

import com.fourj.userservice.model.UserProfile.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerVerificationDto {
    @NotNull(message = "Trạng thái xác thực không được để trống")
    private VerificationStatus verificationStatus;
    
    private String verificationNote;
} 