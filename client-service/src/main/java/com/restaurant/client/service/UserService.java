package com.restaurant.client.service;

import com.restaurant.client.dto.AuthResponse;
import com.restaurant.client.dto.LoginRequest;
import com.restaurant.client.dto.RegisterRequest;
import com.restaurant.client.entity.User;
import com.restaurant.client.repository.UserRepository;
import com.restaurant.client.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder;

    public AuthResponse register(RegisterRequest req) {
        if (repo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        user = repo.save(user);
        String token = jwtUtil.generate(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        User user = repo.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Identifiants invalides");
        }
        String token = jwtUtil.generate(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }

    public User findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
    }
}
