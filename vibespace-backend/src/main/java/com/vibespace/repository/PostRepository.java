package com.vibespace.repository;

import com.vibespace.model.PostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, String> {
    List<PostEntity> findAllByOrderByCreatedAtDesc();
}
