package com.Away.blog.controllers;

import com.Away.blog.domain.dtos.AuthorDto;
import com.Away.blog.domain.dtos.RegisterDto;
import com.Away.blog.domain.entity.User;
import com.Away.blog.mappers.UserMapper;
import com.Away.blog.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("wang/shine1/register" )
@RequiredArgsConstructor
public class RegisterController {
    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping
    public ResponseEntity<AuthorDto> registerUser(@Valid @RequestBody RegisterDto registerDto) {
        User newUser = userMapper.toUser(registerDto);
        User user = userService.registerUser(newUser);
        AuthorDto authorDto = userMapper.toAuthorDto(user);
        return new ResponseEntity<>(authorDto, HttpStatus.CREATED);
    }

}
