package com.pixiechat.auth_service.service;

import com.pixiechat.auth_service.dto.*;
import com.pixiechat.auth_service.model.User;
import com.pixiechat.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public AuthResponse register(RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                return AuthResponse.error("Username already exists");
            }
            
            if (userRepository.existsByEmail(request.getEmail())) {
                return AuthResponse.error("Email already exists");
            }
            
            // Create new user
            User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getDateOfBirth()
            );
            
            // Set avatar ID if provided
            if (request.getAvatarId() != null && !request.getAvatarId().isEmpty()) {
                user.setAvatarId(request.getAvatarId());
            }
            
            // Save user to database
            user = userRepository.save(user);
            
            // Generate token (simple UUID for now, can be upgraded to JWT later)
            String token = UUID.randomUUID().toString();
            
            // Create user info for response
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getUsername(),
                user.getAvatarId(),
                user.getDateOfBirth()
            );
            
            return AuthResponse.success(token, userInfo);
            
        } catch (Exception e) {
            return AuthResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            // Find user by username
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            
            if (userOpt.isEmpty()) {
                return AuthResponse.error("User not found");
            }
            
            User user = userOpt.get();
            
            // Check password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return AuthResponse.error("Invalid password");
            }
            
            // Generate token
            String token = UUID.randomUUID().toString();
            
            // Create user info for response
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getUsername(),
                user.getAvatarId(),
                user.getDateOfBirth()
            );
            
            return AuthResponse.success(token, userInfo);
            
        } catch (Exception e) {
            return AuthResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllUsers();
        }
        
        // Simple search by first name, last name, or username
        return userRepository.findAll().stream()
            .filter(user -> 
                user.getFirstName().toLowerCase().contains(query.toLowerCase()) ||
                user.getLastName().toLowerCase().contains(query.toLowerCase()) ||
                user.getUsername().toLowerCase().contains(query.toLowerCase())
            )
            .toList();
    }
}
