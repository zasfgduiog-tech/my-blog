package com.Away.blog.services.impl;

import com.Away.blog.domain.CreatePostRequest;
import com.Away.blog.domain.PostStatus;
import com.Away.blog.domain.UpdatePostRequest;
import com.Away.blog.domain.entity.Category;
import com.Away.blog.domain.entity.Post;
import com.Away.blog.domain.entity.Tag;
import com.Away.blog.domain.entity.User;
import com.Away.blog.repositories.PostRepository;
import com.Away.blog.services.*;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
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
    private final UserService userService;


    @Override
    public Post getPost(UUID id) {
        return  postRepository.findById(id).orElseThrow(()->new EntityNotFoundException("Post not found"));
    }

    @Override
    public void deletePost(UUID id) throws AccessDeniedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User user = userService.findUserByEmail(currentUsername);
        Post post = getPost(id);
        if (!user.getId().equals(post.getAuthor().getId())) {
            throw new AccessDeniedException("您没有权限删除这篇文章");
        }
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
            Category category = categoryService.findCategoryById(categoryId);
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
    public Post updatePost(UUID id, UpdatePostRequest updatePostRequest) throws AccessDeniedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User currentUser = userService.findUserByEmail(currentUsername);
        Post post = getPost(id);
        if (!currentUser.getId().equals(post.getAuthor().getId())) {
            throw new AccessDeniedException("您没有权限编辑这篇文章");
        }
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


    public static int calculateReadingTime(String content) {
        if (content == null || content.isEmpty()) {
            return 0;
        }
        // 1. 定义每个字符需要的分钟数（根据平均阅读速度300字/分钟）
        final int CHARACTERS_PER_MINUTE = WORDS_PER_MINUTE;

        // 2. 去除所有HTML标签，得到纯文本内容
        String plainText = content.replaceAll("<[^>]*>", "");

        // 2. 去除所有空白字符（包括空格、换行、制表符等），得到纯粹的字符
        String pureCharacters = plainText.replaceAll("\\s", "");

        // 3. 计算字符数
        int characterCount = pureCharacters.length();

        if (characterCount == 0) {
            return 0;
        }

        // 4. 使用正确的公式进行计算
        // (double)characterCount 确保了除法是浮点数除法
        double minutes = (double) characterCount / CHARACTERS_PER_MINUTE;

        // 5. 向上取整，确保即使只有几个字，也显示为1分钟
        int readingTime = (int) Math.ceil(minutes);

        // 6. 确保最短阅读时间为1分钟（对于有内容但计算结果小于1的情况）
        return Math.max(1, readingTime);
    }
}
