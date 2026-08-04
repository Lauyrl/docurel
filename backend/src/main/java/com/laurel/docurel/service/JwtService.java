package com.laurel.docurel.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.laurel.docurel.entity.UserEntity;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(UserEntity entity) {
        return Jwts.builder()              // creates an empty token to "fill in"
            .subject(entity.getUsername()) // specifies who/what the token identifies: username or email
            .issuedAt(new Date())          // token creation time
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())     // "sign" token with a "secret" only the server knows, to validate valid tokens, and detect forged/tampered with tokens
            .compact();                    // using the provided information, serializes the builder into a String
    }

    public SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes); /* verifies secret is long enough, 
                                                then wraps bytes in a SecretKey object suitable for HMAC-SHA signing algorithm */
    }

    public String extractSubject(String jwtToken) {
        return Jwts.parser()              // create a parser builder, defines how to parse ('read') the JWT token
            .verifyWith(getSigningKey())  // configure key used to verify token signature for the builder
            .build()                      // build the token parser
            .parseSignedClaims(jwtToken)  // get the token and its' claims, and verify signature; claims: a token's original contents (subject, signingKey, issuedAt,...) 
            .getPayload()                 // get claims
            .getSubject();                // get the 'subject' claim
    }
}
