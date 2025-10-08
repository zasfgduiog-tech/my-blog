package com.Away.blog.services.impl;

import com.Away.blog.domain.entity.Tag;
import com.Away.blog.repositories.TagRepository;
import com.Away.blog.services.TagService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;

    @Override
    public List<Tag> getTags() {
        return tagRepository.findAllWithPostsCount();
    }

    @Override
    @Transactional
    public List<Tag> createTags(Set<String> tagNames) {
        List<Tag> existingTags = tagRepository.findByNameIn(tagNames);
        Set<String> existingTagNames = existingTags
                .stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());
        List<Tag> newTags = tagNames.stream().filter(name -> !existingTagNames.contains(name))
                .map(name-> Tag.builder().name(name).posts(new HashSet<>()).build())
                .toList();
        List<Tag> saveTags = new ArrayList<>();
        if(!newTags.isEmpty()) {
            saveTags=tagRepository.saveAll(newTags);
        }
        saveTags.addAll(existingTags);
        return saveTags;
    }

    @Override
    public void deleteTags(UUID tagId) {
        tagRepository.findById(tagId).ifPresent(tag -> {
            if(!tag.getPosts().isEmpty()) {
                throw new IllegalStateException("Can not delete tag with posts!");
            }
            tagRepository.deleteById(tagId);
        });
    }

    @Override
    public Tag findTagById(UUID tagId) {
        return tagRepository.findById(tagId).orElseThrow(()->new EntityNotFoundException("Tag is  not found!"+tagId));
    }

    @Override
    public List<Tag> findTagByIds(Set<UUID> tagIds) {
        List<Tag> foundTags =  tagRepository.findAllById(tagIds);
        if (foundTags.size() != tagIds.size()) {
            throw new EntityNotFoundException("Not all tags found!");
        }
        return foundTags;
    }

}
