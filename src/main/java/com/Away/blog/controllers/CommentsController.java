package com.Away.blog.controllers;

import com.Away.blog.domain.CreateCommentRequest;
import com.Away.blog.domain.dtos.CommentDto;
import com.Away.blog.domain.dtos.CreateCommentRequestDto;
import com.Away.blog.domain.entity.Comment;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.User;
import com.Away.blog.mappers.CommentMapper;
import com.Away.blog.services.CommentService;
import com.Away.blog.services.PostService;
import com.Away.blog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/wang/shine1/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentsController {
    private final CommentService commentService;
    private final PostService postService;
    private final CommentMapper commentMapper;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<CommentDto>> findAllByPost(@PathVariable UUID postId) {
        Post post = postService.getPost(postId);
        List<Comment> comments = commentService.findAllByPost(post);
        List<CommentDto> commentDtos = comments.stream()
                .map(commentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(commentDtos);
    }

    @PostMapping
    public ResponseEntity<CommentDto> createComment(@PathVariable UUID postId,
                                                    @RequestBody CreateCommentRequestDto createCommentRequestDto,
                                                    @RequestAttribute UUID userId) {
        User user = userService.getUserById(userId);
        CreateCommentRequest createCommentRequest = commentMapper.toEntity(createCommentRequestDto);
        Comment comment = commentService.createComment(createCommentRequest, user, postId);
        CommentDto createCommentDto = commentMapper.toDto(comment);

        return new ResponseEntity<>(createCommentDto, HttpStatus.CREATED);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) throws AccessDeniedException {
        commentService.deleteCommentById(commentId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
