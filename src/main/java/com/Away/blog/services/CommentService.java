package com.Away.blog.services;

import com.Away.blog.domain.CreateCommentRequest;
import com.Away.blog.domain.entity.Comment;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.User;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

public interface CommentService {
    Comment createComment(CreateCommentRequest createCommentRequest, User user, UUID postId);
    List<Comment> findAllByPost(Post post);
    void deleteCommentById(UUID commentId) throws AccessDeniedException;
}
