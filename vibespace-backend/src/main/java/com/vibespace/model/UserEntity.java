package com.vibespace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    private String id;
    private String name;
    private String username;

    @Column(length = 1000)
    private String avatar;

    @Column(length = 1000)
    private String bio;

    private int followersCount;
    private int followingCount;
    private int postsCount;
    private String privacy;
    private String joinedDate;
    private String onlineStatus;

    public UserEntity() {}

    public UserEntity(String id, String name, String username, String avatar, String bio,
                      int followersCount, int followingCount, int postsCount,
                      String privacy, String joinedDate, String onlineStatus) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.avatar = avatar;
        this.bio = bio;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.postsCount = postsCount;
        this.privacy = privacy;
        this.joinedDate = joinedDate;
        this.onlineStatus = onlineStatus;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public int getFollowersCount() { return followersCount; }
    public void setFollowersCount(int followersCount) { this.followersCount = followersCount; }

    public int getFollowingCount() { return followingCount; }
    public void setFollowingCount(int followingCount) { this.followingCount = followingCount; }

    public int getPostsCount() { return postsCount; }
    public void setPostsCount(int postsCount) { this.postsCount = postsCount; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getOnlineStatus() { return onlineStatus; }
    public void setOnlineStatus(String onlineStatus) { this.onlineStatus = onlineStatus; }
}
