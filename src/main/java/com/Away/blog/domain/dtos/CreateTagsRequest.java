package com.Away.blog.domain.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTagsRequest {

    @NotEmpty(message = "At least one tag name is required")
    @Size(max = 10,message = "Maximum {max} tags are allowed")
    private Set<
                @Size(min = 2,max=30,message = "Tag name must be between {min} and {max} characters")
                @Pattern(regexp = "^[\\w\\s-\\u4e00-\\u9fa5]+$", message = "Tags name must contain only letters, numbers, and underscores")
                        String> names;
}
