package com.Away.blog.mappers;


import com.Away.blog.domain.CreatePostRequest;
import com.Away.blog.domain.UpdatePostRequest;
import com.Away.blog.domain.dtos.CreatePostRequestDto;
import com.Away.blog.domain.dtos.PostDto;
import com.Away.blog.domain.dtos.UpdatePostRequestDto;
import com.Away.blog.domain.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PostMapper {
    @Mapping(target = "author",source = "author")
    @Mapping(target = "category",source = "category")
    @Mapping(target = "tags",source = "tags")
    PostDto toDto(Post post);

    CreatePostRequest createPostRequest(CreatePostRequestDto Dto);
    UpdatePostRequest updatePostRequest(UpdatePostRequestDto Dto);
}
