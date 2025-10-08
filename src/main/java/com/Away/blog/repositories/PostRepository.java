package com.Away.blog.repositories;

import com.Away.blog.domain.PostStatus;
import com.Away.blog.domain.entity.Category;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.Tag;
import com.Away.blog.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findAllByStatusAndCategoryAndTagsContaining(PostStatus status, Category category, Tag tag);
    List<Post> findAllByStatusAndCategory(PostStatus status, Category category);
    List<Post> findAllByStatusAndTagsContaining(PostStatus status, Tag tag);
    List<Post> findAllByStatus(PostStatus status);
    List<Post> findDraftsByAuthorAndStatus(User user,PostStatus status);
}
