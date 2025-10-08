package com.Away.blog.services.impl;

import com.Away.blog.domain.CreatePostRequest;
import com.Away.blog.domain.PostStatus;
import com.Away.blog.domain.UpdatePostRequest;
import com.Away.blog.domain.entity.Category;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.Tag;
import com.Away.blog.domain.entity.User;
import com.Away.blog.repositories.PostRepository;
import com.Away.blog.services.CategoryService;
import com.Away.blog.services.PostService;
import com.Away.blog.services.TagService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CategoryService categoryService;
    private final TagService tagService;
    private static final int WORDS_PER_MINUTE = 300;

    @Override
    public Post getPost(UUID id) {
        return  postRepository.findById(id).orElseThrow(()->new EntityNotFoundException("Post not found"));
    }

    @Override
    public void deletePost(UUID id) {
        Post post = getPost(id);
        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> getAllPosts(UUID categoryId, UUID tagId) {
        if(categoryId != null && tagId != null){
            Category category = categoryService.findCategoryById(categoryId);
            Tag tag = tagService.findTagById(tagId);
            return postRepository.findAllByStatusAndCategoryAndTagsContaining(
                    PostStatus.PUBLISHED, category, tag
            );
        }
        if (categoryId != null) {
            Category category = categoryService.findCategoryById(tagId);
            return postRepository.findAllByStatusAndCategory(
                    PostStatus.PUBLISHED, category);
        }
        if(tagId != null) {
            Tag tag = tagService.findTagById(tagId);
            return postRepository.findAllByStatusAndTagsContaining(
                    PostStatus.PUBLISHED, tag
            );
        }
        return postRepository.findAllByStatus(PostStatus.PUBLISHED);
    }

    @Override
    public List<Post> getDrafts(User user) {
        return postRepository.findDraftsByAuthorAndStatus(user, PostStatus.DRAFT);
    }

    @Override
    @Transactional
    public Post createPost(User user, CreatePostRequest createPostRequest) {
        Post newpost = new Post();
        newpost.setAuthor(user);
        newpost.setCategory(categoryService.findCategoryById(createPostRequest.getCategoryId()));
        newpost.setTitle(createPostRequest.getTitle());
        newpost.setContent(createPostRequest.getContent());
        newpost.setStatus(createPostRequest.getStatus());
        newpost.setReadingTime(calculateReadingTime(createPostRequest.getContent()));
        Set<UUID> tagIds = createPostRequest.getTagIds();
        List<Tag> tags = tagService.findTagByIds(tagIds);
        newpost.setTags(new HashSet<>(tags));
        return postRepository.save(newpost);
    }

    @Override
    @Transactional
    public Post updatePost(UUID id, UpdatePostRequest updatePostRequest) {
        Post existingPost = postRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("post with id " + id + " not found")
        );
        existingPost.setTitle(updatePostRequest.getTitle());
        existingPost.setContent(updatePostRequest.getContent());
        existingPost.setStatus(updatePostRequest.getStatus());
        existingPost.setReadingTime(calculateReadingTime(updatePostRequest.getContent()));

        UUID updatePostRequestCategoryId = updatePostRequest.getCategoryId();
        if(updatePostRequestCategoryId != null){
            Category category = categoryService.findCategoryById(updatePostRequestCategoryId);
            existingPost.setCategory(category);
        }

        Set<UUID> existingTagIds = existingPost.getTags().stream().map(Tag::getId).collect(Collectors.toSet());
        Set<UUID> tagIdSet = updatePostRequest.getTagIds();
        if(!existingTagIds.equals(tagIdSet)){
            List<Tag> newTags = tagService.findTagByIds(tagIdSet);
            existingPost.setTags(new HashSet<>(newTags));
        }
        return postRepository.save(existingPost);
    }

    private Integer calculateReadingTime(String content){
        if(content == null || content.isEmpty()){
            return 0;
        }

        int wordCount = content.trim().split("\\s+").length;

        return (int)Math.ceil((double)wordCount / WORDS_PER_MINUTE+1);
    }
}
