package com.vibespace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "posts")
public class PostEntity {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private UserEntity author;

    private String createdAt;

    @Column(length = 4000)
    private String content;

    @Column(length = 2000)
    private String mediaUrl;

    private String mediaType; // "image" or "video"

    @ManyToOne
    @JoinColumn(name = "track_id")
    private TrackEntity sharedTrack;

    private String sharedNote;

    private int likesCount;
    private int commentsCount;
    private int sharesCount;
    private boolean isLiked;
    private boolean isSaved;

    public PostEntity() {}

    public PostEntity(String id, UserEntity author, String createdAt, String content, String mediaUrl, String mediaType,
                      TrackEntity sharedTrack, String sharedNote, int likesCount, int commentsCount, int sharesCount) {
        this.id = id;
        this.author = author;
        this.createdAt = createdAt;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.sharedTrack = sharedTrack;
        this.sharedNote = sharedNote;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.sharesCount = sharesCount;
        this.isLiked = false;
        this.isSaved = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public UserEntity getAuthor() { return author; }
    public void setAuthor(UserEntity author) { this.author = author; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public TrackEntity getSharedTrack() { return sharedTrack; }
    public void setSharedTrack(TrackEntity sharedTrack) { this.sharedTrack = sharedTrack; }

    public String getSharedNote() { return sharedNote; }
    public void setSharedNote(String sharedNote) { this.sharedNote = sharedNote; }

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }

    public int getCommentsCount() { return commentsCount; }
    public void setCommentsCount(int commentsCount) { this.commentsCount = commentsCount; }

    public int getSharesCount() { return sharesCount; }
    public void setSharesCount(int sharesCount) { this.sharesCount = sharesCount; }

    public boolean isLiked() { return isLiked; }
    public void setLiked(boolean liked) { isLiked = liked; }

    public boolean isSaved() { return isSaved; }
    public void setSaved(boolean saved) { isSaved = saved; }
}
