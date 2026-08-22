package com.vibespace.controller;

import com.vibespace.model.UserEntity;
import com.vibespace.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/me")
    public ResponseEntity<UserEntity> getCurrentUser() {
        Optional<UserEntity> userOpt = userRepository.findById("usr-alex");
        return userOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable String id) {
        Optional<UserEntity> userOpt = userRepository.findById(id);
        return userOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> updateUser(@PathVariable String id, @RequestBody UserEntity updatedUser) {
        Optional<UserEntity> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UserEntity existing = userOpt.get();
        if (updatedUser.getName() != null) existing.setName(updatedUser.getName());
        if (updatedUser.getBio() != null) existing.setBio(updatedUser.getBio());
        if (updatedUser.getAvatar() != null) existing.setAvatar(updatedUser.getAvatar());
        if (updatedUser.getPrivacy() != null) existing.setPrivacy(updatedUser.getPrivacy());

        UserEntity saved = userRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
}
