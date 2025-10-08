package com.Away.blog.services;

import com.Away.blog.domain.dtos.LoginRequest;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthenticationServices {
    UserDetails authenticate(String email, String password);
    String generateToken(UserDetails userDetails);
    UserDetails validateToken(String token);
}
