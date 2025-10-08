package com.Away.blog.services.impl;

import com.Away.blog.domain.entity.User;
import com.Away.blog.repositories.UserRepository;
import com.Away.blog.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;



    @Override
    public User getUserById(UUID userId) {
        return userRepository.findById(userId).orElseThrow(()->new EntityNotFoundException("User is  not found!"+userId));
    }

    @Override
    public User reserve(String email, String name, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        // 2. 创建新的 User 实体
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);

        // 3. 对密码进行加密！这是最重要的一步！
        newUser.setPassword(passwordEncoder.encode(password));

        // 4. 保存用户到数据库
        return userRepository.save(newUser);
    }
    }
