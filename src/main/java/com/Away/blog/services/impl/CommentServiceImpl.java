package com.Away.blog.services.impl;

import com.Away.blog.domain.CreateCommentRequest;
import com.Away.blog.domain.entity.User;
import com.Away.blog.services.CommentService;

import com.Away.blog.domain.entity.Comment;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.repositories.CommentRepository;
import com.Away.blog.services.PostService;
import com.Away.blog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;



    @Override
    public Comment createComment(CreateCommentRequest createCommentRequest, User user, UUID postId) {
        Comment comment = Comment.builder()
                .content(createCommentRequest.getContent())
                .author(user)
                .post(postService.getPost(postId))
                .createdAt(LocalDateTime.now())
                .build();
        return commentRepository.save(comment);
    }

    @Override
    public List<Comment> findAllByPost(Post post) {
        return commentRepository.findAllByPost(post);
    }

    @Override
    public void deleteCommentById(UUID commentId) throws AccessDeniedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User user = userService.findUserByEmail(currentUsername);
        Comment comment = commentRepository.findById(commentId).orElseThrow(
                () -> new IllegalArgumentException("comment with id " + commentId + " not found")
        );
        if (!user.getId().equals(comment.getAuthor().getId())) {
            throw new AccessDeniedException("您没有权限删除这篇评论");
        }

        commentRepository.deleteById(commentId);
    }
}
