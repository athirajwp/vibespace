package com.vibespace.config;

import com.vibespace.model.*;
import com.vibespace.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final PostRepository postRepository;
    private final MessageRepository messageRepository;

    public DataSeeder(UserRepository userRepository, TrackRepository trackRepository,
                      PostRepository postRepository, MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.trackRepository = trackRepository;
        this.postRepository = postRepository;
        this.messageRepository = messageRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Main User
        UserEntity currentUser = new UserEntity(
                "usr-alex",
                "Alex Rivera ✨",
                "alex_vibes",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
                "Audio Creator & Music Producer 🎧",
                1240, 480, 42,
                "public", "January 2024", "online"
        );
        userRepository.save(currentUser);

        // Seed Partner User
        UserEntity samUser = new UserEntity(
                "usr-sam",
                "Sam Chen",
                "sam_melody",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
                "Lo-Fi Beats Producer 🎵",
                3200, 290, 84,
                "public", "February 2024", "online"
        );
        userRepository.save(samUser);

        // Seed Tracks
        TrackEntity t1 = new TrackEntity(
                "trk-starlight",
                "Starlight Coffee (Lo-Fi)",
                "Luna Chill",
                "Rainy Cafe Sessions",
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
                184,
                "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
                "Lo-Fi"
        );

        TrackEntity t2 = new TrackEntity(
                "trk-midnight",
                "Midnight City Lights",
                "Aether & Kael",
                "Neon Horizons",
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
                215,
                "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
                "Synthwave"
        );

        trackRepository.save(t1);
        trackRepository.save(t2);

        // Seed Posts
        PostEntity p1 = new PostEntity(
                "post-1",
                samUser,
                "15m ago",
                "Nothing hits harder on a late Friday night than synchronized Lo-Fi listening across time zones. Listening to this continuous ambient stream with Alex ❤️🎧",
                null,
                null,
                t1,
                "Press Play to listen with us right now!",
                48, 12, 5
        );
        p1.setLiked(true);

        PostEntity p2 = new PostEntity(
                "post-2",
                currentUser,
                "Just now",
                "Vibing on VibeSpace ✨",
                null,
                null,
                t2,
                "Check out this song! 🎵",
                1, 1, 0
        );

        postRepository.save(p1);
        postRepository.save(p2);

        // Seed Initial Messages
        MessageEntity m1 = new MessageEntity(
                "m-1", "conv-maya", "usr-alex", "Alex Rivera ✨",
                currentUser.getAvatar(),
                "Hey Maya! Ready for tonight's music session? 🎧",
                "10:10 PM", "text"
        );
        messageRepository.save(m1);
    }
}
