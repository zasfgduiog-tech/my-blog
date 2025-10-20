package com.Away.blog.services;

import com.Away.blog.domain.CreatePostRequest;
import com.Away.blog.domain.UpdatePostRequest;
import com.Away.blog.domain.dtos.CreatePostRequestDto;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.User;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

public interface PostService {
    Post getPost(UUID id);
    void deletePost(UUID id) throws AccessDeniedException;
    List<Post> getAllPosts(UUID categoryId, UUID tagId);
    List<Post> getDrafts(User user);
    Post createPost(User user, CreatePostRequest createPostRequest);
    Post updatePost(UUID id, UpdatePostRequest updatePostRequest) throws AccessDeniedException;
}
