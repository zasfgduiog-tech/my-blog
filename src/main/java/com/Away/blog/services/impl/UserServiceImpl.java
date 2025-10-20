package com.Away.blog.services.impl;
import com.Away.blog.domain.Role;
import com.Away.blog.domain.entity.User;
import com.Away.blog.repositories.UserRepository;
import com.Away.blog.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDate.now());
        user.setRole(user.getRole() == null ? Role.USER : user.getRole());
        return userRepository.save(user);
    }

    @Override
    public User findUserByUsername(String name) {
        return userRepository.findByName(name);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(()->new EntityNotFoundException("User is  not found!"+email));
    }

}
