package com.fourj.userservice.service;

import com.fourj.userservice.dto.UserProfileDto;
import com.fourj.userservice.dto.UserProfileUpdateDto;
import com.fourj.userservice.model.UserProfile;

import java.util.List;

public interface UserProfileService {
    UserProfileDto createUserProfile(UserProfile userProfile);
    UserProfileDto getUserProfileByAuth0Id(String auth0Id);
    UserProfileDto updateUserProfile(String auth0Id, UserProfileUpdateDto userProfileUpdateDto);
    List<UserProfileDto> getAllUserProfiles();
    void deleteUserProfile(String auth0Id);
    boolean userProfileExists(String auth0Id);
}