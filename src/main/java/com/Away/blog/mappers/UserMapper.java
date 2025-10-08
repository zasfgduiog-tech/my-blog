package com.Away.blog.mappers;

import com.Away.blog.domain.dtos.AuthorDto;
import com.Away.blog.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    AuthorDto toAuthorDto(User user);
}
