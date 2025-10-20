package com.Away.blog.controllers; // 请确保这是您正确的包名

import com.Away.blog.domain.entity.User; // 导入您的 User 实体类
import com.Away.blog.security.BlogUserDetails; // 导入您的 BlogUserDetails 类
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/wang/shine1") // 使用您自己的路径前缀
public class TestController {

    /**
     * 这个接口专门用来测试 @AuthenticationPrincipal 是否能成功注入当前登录用户。
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal BlogUserDetails currentUser) {

        // 【诊断点一】检查 currentUser 是否为 null
        if (currentUser == null) {
            // 如果 currentUser 是 null，说明认证信息没有被正确传递到 Controller。
            // 这意味着 JWT 过滤器 或 UserDetailsService 出了问题。
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "无法获取当前用户信息，@AuthenticationPrincipal 返回了 null");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        // 如果能走到这里，说明 @AuthenticationPrincipal 工作正常！
        User user = currentUser.getUser();

        // 【诊断点二】检查从 UserDetails 中获取的 User 实体是否为 null
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "BlogUserDetails 不为 null，但内部的 User 对象为 null");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // 构建一个简单的响应，返回用户名和邮箱
        Map<String, String> userResponse = new HashMap<>();
        userResponse.put("name", user.getName());
        userResponse.put("email", user.getEmail());
        userResponse.put("role", user.getRole().name());
        userResponse.put("id", user.getId().toString());

        // 如果能成功返回这个，说明整个认证链路是通畅的！
        return ResponseEntity.ok(userResponse);
    }
}
