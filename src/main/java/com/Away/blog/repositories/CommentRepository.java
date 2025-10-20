package com.Away.blog.repositories;

import com.Away.blog.domain.entity.Comment;
import com.Away.blog.domain.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findAllByPost(Post post);
}
