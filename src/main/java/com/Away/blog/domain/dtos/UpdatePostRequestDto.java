package com.Away.blog.domain.dtos;

import com.Away.blog.domain.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePostRequestDto {
    @NotNull(message = "id is required")
    private UUID id;

    @NotBlank(message = "title is required")
    @Size(min = 3,max=40,message = "title must be between {min} and {max} characters")
    private String title;

    @NotBlank(message = "content is required")
    @Size(min = 20 ,max=50000,message = "content must be between {min} and {max} characters")
    private String content;

    @NotNull(message = "categoryID is required")
    private UUID categoryId;

    @Builder.Default
    @Size(max = 10,message = "Maximum {max} tags are allowed")
    private Set<UUID> tagIds = new HashSet<>();

    @NotNull(message = "status is required")
    private PostStatus status;
}
