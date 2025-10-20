package com.Away.blog.domain.dtos;

import com.Away.blog.domain.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentDto {
    private UUID id;
    private PostDto post;
    private AuthorDto author;
    private String content;
}
