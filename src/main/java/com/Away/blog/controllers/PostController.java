package com.Away.blog.controllers;

import com.Away.blog.domain.CreatePostRequest;
import com.Away.blog.domain.PostStatus;
import com.Away.blog.domain.UpdatePostRequest;
import com.Away.blog.domain.dtos.CreatePostRequestDto;
import com.Away.blog.domain.dtos.PostDto;
import com.Away.blog.domain.dtos.UpdatePostRequestDto;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.User;
import com.Away.blog.mappers.PostMapper;
import com.Away.blog.security.BlogUserDetails;
import com.Away.blog.services.PostService;
import com.Away.blog.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = {"/wang/shine1/posts"})
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final PostMapper postMapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID tagId) {
        List<Post> posts = postService.getAllPosts(categoryId, tagId);
        List<PostDto> postDto = posts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDto);
    }

    @GetMapping(path = "/drafts")
    public ResponseEntity<List<PostDto>> getDrafts(@RequestAttribute UUID userId) {
        User user = userService.getUserById(userId);
        List<Post> posts = postService.getDrafts(user);
        List<PostDto> postDto = posts.stream().map(postMapper::toDto).toList();
        return ResponseEntity.ok(postDto);
    }

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody CreatePostRequestDto createPostRequestDto,
            @RequestAttribute UUID userId) {
        User loggedInUser = userService.getUserById(userId);
        CreatePostRequest createPostRequest = postMapper.createPostRequest(createPostRequestDto);
        Post createdPost = postService.createPost(loggedInUser, createPostRequest);
        PostDto createdPostDto = postMapper.toDto(createdPost);
        return new ResponseEntity<>(createdPostDto, HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePostRequestDto updatePostRequestDto
            ){
        UpdatePostRequest updatePostRequest = postMapper.updatePostRequest(updatePostRequestDto);
        Post updatePost = postService.updatePost(id, updatePostRequest);
        return ResponseEntity.ok(postMapper.toDto(updatePost));
    }

    @GetMapping(path = "/{id}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable UUID id
    ) {
        Post post = postService.getPost(id);
        PostDto postDto = postMapper.toDto(post);
        return ResponseEntity.ok(postDto);
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID id
    )
        {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
        }
}
