package com.laurel.docurel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.laurel.docurel.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Blowfish enCrypt: one-way hashing
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        // put the JwtAuthenticationFilter before Spring's default HTML UsernamePasswordAuthenticationFilter
        
        http
            // Disable CSRF protection because we don't rely on server-side sessions or browser cookies.
            // Instead, our REST API authenticates with JWTs tokens in an Authorization header,
            .csrf(csrf -> csrf.disable())

            // Configure authorization rules for incoming HTTP requests.
            .authorizeHttpRequests(auth -> auth
                
                // If the request URL matches these endpoints,
                // They are permitted without already being authenticated.
                .requestMatchers("/auth/register", "/auth/login").permitAll()

                // Every request that didn't match a previous rule must be authenticated.
                // Right now, this simply means "the user must be authenticated already."
                // Later, after adding JWT authentication, this will mean
                // "the request must contain a valid JWT."
                .anyRequest().authenticated()
            );

        // Build the configured security filter chain (chain of security-related filters) and register it as a Spring Bean.
        // Every HTTP request passes through this chain before reaching a controller.
        return http.build();
    }
}
