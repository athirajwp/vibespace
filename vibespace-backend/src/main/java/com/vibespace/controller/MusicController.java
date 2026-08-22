package com.vibespace.controller;

import com.vibespace.model.TrackEntity;
import com.vibespace.repository.TrackRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracks")
public class MusicController {

    private final TrackRepository trackRepository;

    public MusicController(TrackRepository trackRepository) {
        this.trackRepository = trackRepository;
    }

    @GetMapping
    public List<TrackEntity> getAllTracks() {
        return trackRepository.findAll();
    }
}
