package com.laurel.docurel.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.repository.UserRepository;
import com.laurel.docurel.service.JwtService;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.lang.Collections;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component // Most generic Bean annotation
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) { // if no JWT,
            filterChain.doFilter(request, response);                   // dont reject, pass to next filter that might accept it
            return;
        }
        String jwtToken = authHeader.split(" ")[1];
        try {
            String usernameOrEmail = jwtService.extractSubject(jwtToken);
            UserEntity user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail).orElse(null);
            if (user != null) {
                UsernamePasswordAuthenticationToken authenticationToken = 
                    new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        } 
        catch (JwtException e) {
            // thrown by jwtService.extractSubject() when given invalid token
        }
        filterChain.doFilter(request, response);  
    }
}
