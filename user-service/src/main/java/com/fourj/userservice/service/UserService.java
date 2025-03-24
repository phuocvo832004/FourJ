package com.fourj.userservice.service;

import com.fourj.userservice.dto.*;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(Long id);
    UserResponse getCurrentUser();
    void deleteUser(Long id);
    JwtResponse login(LoginRequest request);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void changePassword(Long id, ChangePasswordRequest request);
    void resetPassword(String email);
}
