package com.restaurant.client.config;

import com.restaurant.client.entity.Role;
import com.restaurant.client.entity.User;
import com.restaurant.client.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;

    @Override
    public void run(String... args) {
        List.of(
                testUser("client@test.com", Role.CLIENT),
                testUser("chef@test.com",   Role.CHEF),
                testUser("livreur@test.com", Role.LIVREUR)
        ).forEach(user -> {
            if (!repo.existsByEmail(user.getEmail())) {
                repo.save(user);
            }
        });
    }

    private User testUser(String email, Role role) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(encoder.encode("password"));
        u.setRole(role);
        return u;
    }
}
