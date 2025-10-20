package com.Away.blog.domain.dtos;

import com.Away.blog.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AuthorDto {
    private UUID id;
    private String name;
    private String email;
    private Role role;
}
