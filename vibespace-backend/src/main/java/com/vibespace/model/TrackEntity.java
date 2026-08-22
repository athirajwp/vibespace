package com.vibespace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tracks")
public class TrackEntity {

    @Id
    private String id;
    private String title;
    private String artist;
    private String album;

    @Column(length = 1000)
    private String coverArt;

    private int duration;

    @Column(length = 1000)
    private String audioUrl;

    private String genre;

    public TrackEntity() {}

    public TrackEntity(String id, String title, String artist, String album, String coverArt, int duration, String audioUrl, String genre) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.coverArt = coverArt;
        this.duration = duration;
        this.audioUrl = audioUrl;
        this.genre = genre;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getAlbum() { return album; }
    public void setAlbum(String album) { this.album = album; }

    public String getCoverArt() { return coverArt; }
    public void setCoverArt(String coverArt) { this.coverArt = coverArt; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
}
