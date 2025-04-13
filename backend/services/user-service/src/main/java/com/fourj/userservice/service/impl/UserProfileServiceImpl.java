package com.fourj.userservice.service.impl;

import com.fourj.userservice.dto.UserProfileDto;
import com.fourj.userservice.dto.UserProfileUpdateDto;
import com.fourj.userservice.exception.ResourceNotFoundException;
import com.fourj.userservice.model.UserProfile;
import com.fourj.userservice.repository.UserProfileRepository;
import com.fourj.userservice.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Autowired
    public UserProfileServiceImpl(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    @Transactional
    public UserProfileDto createUserProfile(UserProfile userProfile) {
        UserProfile savedUserProfile = userProfileRepository.save(userProfile);
        return mapToDto(savedUserProfile);
    }

    @Override
    public UserProfileDto getUserProfileByAuth0Id(String auth0Id) {
        UserProfile userProfile = userProfileRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
        return mapToDto(userProfile);
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(String auth0Id, UserProfileUpdateDto updateDto) {
        UserProfile userProfile = userProfileRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        // Cập nhật thông tin người dùng nếu có
        if (updateDto.getFullName() != null) {
            userProfile.setFullName(updateDto.getFullName());
        }
        if (updateDto.getPhone() != null) {
            userProfile.setPhone(updateDto.getPhone());
        }
        if (updateDto.getFullAddress() != null) {
            userProfile.setFullAddress(updateDto.getFullAddress());
        }
        if (updateDto.getDateOfBirth() != null) {
            userProfile.setDateOfBirth(updateDto.getDateOfBirth());
        }
        if (updateDto.getGender() != null) {
            userProfile.setGender(updateDto.getGender());
        }
        if (updateDto.getAvatarUrl() != null) {
            userProfile.setAvatarUrl(updateDto.getAvatarUrl());
        }
        if (updateDto.getBiography() != null) {
            userProfile.setBiography(updateDto.getBiography());
        }

        UserProfile updatedUserProfile = userProfileRepository.save(userProfile);
        return mapToDto(updatedUserProfile);
    }

    @Override
    public List<UserProfileDto> getAllUserProfiles() {
        return userProfileRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUserProfile(String auth0Id) {
        UserProfile userProfile = userProfileRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
        userProfileRepository.delete(userProfile);
    }

    @Override
    public boolean userProfileExists(String auth0Id) {
        return userProfileRepository.existsByAuth0Id(auth0Id);
    }

    private UserProfileDto mapToDto(UserProfile userProfile) {
        return UserProfileDto.builder()
                .id(userProfile.getId())
                .auth0Id(userProfile.getAuth0Id())
                .email(userProfile.getEmail())
                .fullName(userProfile.getFullName())
                .phone(userProfile.getPhone())
                .fullAddress(userProfile.getFullAddress())
                .dateOfBirth(userProfile.getDateOfBirth())
                .gender(userProfile.getGender())
                .avatarUrl(userProfile.getAvatarUrl())
                .biography(userProfile.getBiography())
                .createdAt(userProfile.getCreatedAt())
                .updatedAt(userProfile.getUpdatedAt())
                .build();
    }
}