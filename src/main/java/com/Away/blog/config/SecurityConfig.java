package com.Away.blog.config;

import com.Away.blog.domain.Role;
import com.Away.blog.domain.entity.User;
import com.Away.blog.repositories.UserRepository;
import com.Away.blog.security.BlogUserDetailsService;
import com.Away.blog.security.JwtAuthenticationFilter;
import com.Away.blog.services.AuthenticationServices;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(AuthenticationServices authenticationService) {
        return new JwtAuthenticationFilter(authenticationService);
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        BlogUserDetailsService blogUserDetailsService = new BlogUserDetailsService(userRepository);
       return blogUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui.html",    // Swagger UI 的主页面
                                "/swagger-ui/**",      // Swagger UI 的静态资源 (CSS, JS, a-p-i.s 等)
                                "/v3/api-docs/**",     // OpenAPI 3.0 的 JSON a-p-i.s 描述文件
                                "/swagger-resources/**" // Swagger 资源
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/wang/shine1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/wang/shine1/posts/drafts").authenticated()
                        .requestMatchers(HttpMethod.GET, "/wang/shine1/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/wang/shine1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/wang/shine1/tags/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/wang/shine1/register").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
