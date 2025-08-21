package com.pixiechat.auth_service.dto;

public class AuthResponse {
    
    private String token;
    private String message;
    private UserInfo user;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, String message, UserInfo user) {
        this.token = token;
        this.message = message;
        this.user = user;
    }
    
    // Success response
    public static AuthResponse success(String token, UserInfo user) {
        return new AuthResponse(token, "Success", user);
    }
    
    // Error response
    public static AuthResponse error(String message) {
        return new AuthResponse(null, message, null);
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    // Inner class for user information
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String username;
        private String avatarId;
        private String dateOfBirth;
        
        // Constructors
        public UserInfo() {}
        
        public UserInfo(Long id, String firstName, String lastName, String email, String username, String avatarId, String dateOfBirth) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.username = username;
            this.avatarId = avatarId;
            this.dateOfBirth = dateOfBirth;
        }
        
        // Getters and Setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getFirstName() {
            return firstName;
        }
        
        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }
        
        public String getLastName() {
            return lastName;
        }
        
        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getAvatarId() {
            return avatarId;
        }
        
        public void setAvatarId(String avatarId) {
            this.avatarId = avatarId;
        }
        
        public String getDateOfBirth() {
            return dateOfBirth;
        }
        
        public void setDateOfBirth(String dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }
    }
}
