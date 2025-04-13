package com.fourj.userservice.repository;

import com.fourj.userservice.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByAuth0Id(String auth0Id);
    Optional<UserProfile> findByEmail(String email);
    boolean existsByAuth0Id(String auth0Id);
    boolean existsByEmail(String email);
}