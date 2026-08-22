package com.vibespace.controller;

import com.vibespace.model.PostEntity;
import com.vibespace.model.UserEntity;
import com.vibespace.repository.PostRepository;
import com.vibespace.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<PostEntity> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<PostEntity> createPost(@RequestBody PostEntity post) {
        if (post.getId() == null || post.getId().isEmpty()) {
            post.setId("post-" + System.currentTimeMillis());
        }
        if (post.getCreatedAt() == null || post.getCreatedAt().isEmpty()) {
            post.setCreatedAt("Just now");
        }
        if (post.getAuthor() != null && post.getAuthor().getId() != null) {
            Optional<UserEntity> userOpt = userRepository.findById(post.getAuthor().getId());
            userOpt.ifPresent(post::setAuthor);
        }
        PostEntity saved = postRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostEntity> toggleLike(@PathVariable String id) {
        Optional<PostEntity> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PostEntity post = postOpt.get();
        boolean isLiked = !post.isLiked();
        post.setLiked(isLiked);
        post.setLikesCount(isLiked ? post.getLikesCount() + 1 : Math.max(0, post.getLikesCount() - 1));
        PostEntity saved = postRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable String id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully", "id", id));
        }
        return ResponseEntity.notFound().build();
    }
}
