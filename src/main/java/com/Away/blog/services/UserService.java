package com.Away.blog.services;

import com.Away.blog.domain.dtos.RegisterRequest;
import com.Away.blog.domain.entity.User;

import java.util.UUID;

public interface UserService {
    User getUserById(UUID userId);
    User reserve(String email,String name,String password);
}
