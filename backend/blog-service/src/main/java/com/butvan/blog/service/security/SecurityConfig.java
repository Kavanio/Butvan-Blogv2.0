package com.butvan.blog.service.security;

import com.butvan.blog.service.repository.UserRepository;
import com.butvan.blog.common.properties.SecurityProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.butvan.blog.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * Spring Security 核心体系安全拦截与机制配置类
 */
@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final SecurityProperties securityProperties;

    /**
     * 配置 UserDetailsService，对接 JPA 的 UserRepository 查询逻辑
     * <p>支持通过 username 或 email 查找用户（微信用户无 username，JWT subject 为 email）</p>
     *
     * @return UserDetailsService bean
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername() != null ? user.getUsername() : user.getEmail())
                        .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
                        .roles(user.getRole())
                        .disabled(!"ACTIVE".equalsIgnoreCase(user.getStatus()))
                        .build()
                )
                .orElseThrow(() -> new UsernameNotFoundException("用户名不存在: " + username));
    }

    /**
     * 声明 BCrypt 密码加密器 Bean
     *
     * @return PasswordEncoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 声明 AuthenticationManager 用于认证管理
     *
     * @param config 认证配置
     * @return AuthenticationManager
     * @throws Exception 异常
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * 配置过滤规则与安全屏障链
     * <p>公开接口放行路径从 application-security.yml 中读取，
     * 格式为 "METHOD /path" 或 "/path"（不带方法则匹配所有方法）</p>
     *
     * @param http HttpSecurity 配置对象
     * @param jwtAuthFilter 自定义 JWT 过滤器
     * @return 过滤链 SecurityFilterChain
     * @throws Exception 配置异常
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            // 禁用 CSRF
            .csrf(AbstractHttpConfigurer::disable)
            // 启用 CORS 跨域规则，对接 WebMvcConfig 中定义的全局策略
            .cors(Customizer.withDefaults())
            // 禁用 Session，启用 Stateless 无状态模式
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 设定安全请求过滤匹配规则
            .authorizeHttpRequests(auth -> {
                    // 从 YAML 配置中加载公开放行路径
                    applyPermitAllPaths(auth);
                    auth
                        // 后台用户管理接口仅限 ADMIN 角色访问
                        .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                        // 金句墙后台审核接口仅限 ADMIN 角色访问
                        .requestMatchers("/api/admin/quotes/**").hasRole("ADMIN")
                        // 其它任何后台 API 均需校验 Bearer Token 权限身份
                        .anyRequest().authenticated();
                }
            )
            // 配置未认证和未授权时的统一 JSON 响应体
            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint((request, response, authException) -> {
                        response.setContentType("application/json;charset=UTF-8");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write(objectMapper.writeValueAsString(Result.error(401, "未授权，请重新登录")));
                    })
                    .accessDeniedHandler((request, response, accessDeniedException) -> {
                        response.setContentType("application/json;charset=UTF-8");
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.getWriter().write(objectMapper.writeValueAsString(Result.error(403, "无权限访问该资源")));
                    })
            )
            // 将 JWT 过滤器放置在 Spring Security 默认表单拦截器 UsernamePasswordAuthenticationFilter 之前
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 显式定义 CorsConfigurationSource 解决 Spring Security 跨域安全配置问题
     * 解决 allowCredentials(true) 与 allowedOrigins("*") 的冲突
     *
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 允许所有 Origin Pattern（比直接使用 "*" 安全且支持 allowCredentials）
        configuration.setAllowedOriginPatterns(List.of("*"));
        // 注意：必须包含 PATCH，否则 PATCH 请求的 CORS 预检会被 DefaultCorsProcessor 拒绝并返回 403
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * 从 SecurityProperties 配置中解析并应用公开放行路径
     * <p>支持两种格式：
     * <ul>
     *   <li>"METHOD /path" — 仅放行指定 HTTP 方法</li>
     *   <li>"/path" — 放行所有 HTTP 方法</li>
     * </ul>
     * </p>
     *
     * @param auth 授权请求配置构建器
     */
    private void applyPermitAllPaths(
            AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        List<String> paths = securityProperties.getPermitAllPaths();
        if (paths == null || paths.isEmpty()) {
            log.warn("[SecurityConfig] 未配置任何公开放行路径");
            return;
        }
        for (String entry : paths) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) continue;

            // 按首个空格拆分："METHOD /path" → ["METHOD", "/path"]
            int spaceIdx = trimmed.indexOf(' ');
            if (spaceIdx > 0) {
                // 带 HTTP 方法的规则
                String method = trimmed.substring(0, spaceIdx).toUpperCase();
                String path = trimmed.substring(spaceIdx + 1).trim();
                HttpMethod httpMethod = HttpMethod.valueOf(method);
                auth.requestMatchers(AntPathRequestMatcher.antMatcher(httpMethod, path)).permitAll();
                log.debug("[SecurityConfig] 放行 {} {}", method, path);
            } else {
                // 不带方法的规则，匹配所有 HTTP 方法
                auth.requestMatchers(AntPathRequestMatcher.antMatcher(trimmed)).permitAll();
                log.debug("[SecurityConfig] 放行 ALL {}", trimmed);
            }
        }
        log.info("[SecurityConfig] 已加载 {} 条公开放行路径规则", paths.size());
    }
}
