package com.Away.blog.services;

import com.Away.blog.domain.dtos.RegisterDto;
import com.Away.blog.domain.entity.User;

import java.util.UUID;

public interface UserService {
    User getUserById(UUID userId);
    User registerUser(User user);

    User findUserByUsername(String name);

    User findUserByEmail(String email);
}
