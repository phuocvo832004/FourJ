package com.fourj.userservice.controller;

import com.fourj.userservice.dto.UserProfileDto;
import com.fourj.userservice.dto.UserProfileUpdateDto;
import com.fourj.userservice.model.UserProfile;
import com.fourj.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@RestController
@RequestMapping("/api/users/profile")
@Slf4j
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Autowired
    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile(@AuthenticationPrincipal Jwt jwt) {
        String auth0Id = jwt.getSubject();

        if (!userProfileService.userProfileExists(auth0Id)) {
            // Tạo profile người dùng mới nếu chưa tồn tại
            UserProfile newUserProfile = new UserProfile();
            newUserProfile.setAuth0Id(auth0Id);

            // Lấy email từ JWT token claims
            String email = jwt.getClaim("email");
            if (email != null) {
                newUserProfile.setEmail(email);
            }

            // Lấy fullName từ JWT claims
            String name = jwt.getClaim("name");
            if (name != null) {
                newUserProfile.setFullName(name);
            }

            // Lấy avatar từ JWT claims
            String picture = jwt.getClaim("picture");
            if (picture != null) {
                newUserProfile.setAvatarUrl(picture);
            }

            return new ResponseEntity<>(userProfileService.createUserProfile(newUserProfile), HttpStatus.CREATED);
        }

        return ResponseEntity.ok(userProfileService.getUserProfileByAuth0Id(auth0Id));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateCurrentUserProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserProfileUpdateDto updateDto) {
        String auth0Id = jwt.getSubject();
        return ResponseEntity.ok(userProfileService.updateUserProfile(auth0Id, updateDto));
    }

    @GetMapping("/{auth0Id}")
    public ResponseEntity<UserProfileDto> getUserProfileByAuth0Id(@PathVariable String auth0Id) {
        return ResponseEntity.ok(userProfileService.getUserProfileByAuth0Id(auth0Id));
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDto>> getAllUserProfiles() {
        return ResponseEntity.ok(userProfileService.getAllUserProfiles());
    }

    @DeleteMapping("/{auth0Id}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable String auth0Id) {
        userProfileService.deleteUserProfile(auth0Id);
        return ResponseEntity.noContent().build();
    }
}