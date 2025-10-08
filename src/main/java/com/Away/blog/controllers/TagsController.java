package com.Away.blog.controllers;

import com.Away.blog.domain.dtos.TagDto;
import com.Away.blog.domain.dtos.CreateTagsRequest;
import com.Away.blog.domain.entity.Tag;
import com.Away.blog.mappers.TagMapper;
import com.Away.blog.services.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/wang/shine1/tags")
public class TagsController {

    private final TagService tagService;
    private final TagMapper tagMapper;

    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags() {
        List<Tag> tags = tagService.getTags();
        List<TagDto> tagDtoList = tags.stream().map(tagMapper::toTagResponse).toList();
        return ResponseEntity.ok(tagDtoList);
    }

    @PostMapping
    public ResponseEntity<List<TagDto>> createTags(@RequestBody CreateTagsRequest createTagsRequest) {
        List<Tag> saveTags = tagService.createTags(createTagsRequest.getNames());
        List<TagDto> tagDtoList = saveTags.stream().map(tagMapper::toTagResponse).toList();
        return new ResponseEntity<>(tagDtoList, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<List<TagDto>> deleteTags(@PathVariable UUID id) {
        tagService.deleteTags(id);
        return ResponseEntity.noContent().build();
    }
}
