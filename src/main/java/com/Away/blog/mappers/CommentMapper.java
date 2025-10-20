package com.Away.blog.mappers;

import com.Away.blog.domain.CreateCommentRequest;
import com.Away.blog.domain.dtos.CommentDto;
import com.Away.blog.domain.dtos.CreateCommentRequestDto;
import com.Away.blog.domain.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;


@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE,uses = {PostMapper.class,UserMapper.class})
public interface CommentMapper {
    @Mapping(target = "post", source = "post")
    @Mapping(target = "author", source = "author")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "content", source = "content")
    CommentDto toDto(Comment comment);

    @Mapping(target = "content",source = "content")
    CreateCommentRequest toEntity(CreateCommentRequestDto createCommentDto);
}
