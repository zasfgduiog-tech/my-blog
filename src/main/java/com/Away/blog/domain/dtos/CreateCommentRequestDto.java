package com.Away.blog.domain.dtos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateCommentRequestDto {
    @NotBlank
    @Size(min = 1, max = 100)
    @Pattern(regexp = "^[\\w\\s-\\u4e00-\\u9fa5]+$", message = "评论内容只能包含字母、数字和空格")
    private String content;
}
