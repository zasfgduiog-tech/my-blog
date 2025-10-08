package com.Away.blog.services;

import com.Away.blog.domain.entity.Tag;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TagService {
    List<Tag> getTags();
    List<Tag> createTags(Set<String> tagNames);
    void deleteTags(UUID tagId);
    Tag findTagById(UUID tagId);
    List<Tag> findTagByIds(Set<UUID> tagIds);
}
