package com.fourj.userservice.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String temporaryPassword);
    void sendWelcomeEmail(String to, String username);
} 