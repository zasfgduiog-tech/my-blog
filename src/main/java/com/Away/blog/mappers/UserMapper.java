package com.Away.blog.mappers;

import com.Away.blog.domain.dtos.AuthorDto;
import com.Away.blog.domain.dtos.RegisterDto;
import com.Away.blog.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    @Mapping(target = "name",source = "name")
    @Mapping(target = "email",source = "email")
    @Mapping(target = "password",source = "password")
    User toUser(RegisterDto registerDto);

    @Mapping(target = "id",source = "id")
    @Mapping(target = "name",source = "name")
    @Mapping(target = "email",source = "email")
    @Mapping(target = "role",source = "role")
    AuthorDto toAuthorDto(User user);
}
