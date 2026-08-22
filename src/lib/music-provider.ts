import { Track, Playlist } from "@/types";

export interface MusicSearchOptions {
  limit?: number;
  genre?: string;
}

export interface MusicProvider {
  searchTracks(query: string, options?: MusicSearchOptions): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getPlaybackSource(trackId: string): Promise<string>;
  getPreview(trackId: string): Promise<string>;
  searchArtists(query: string): Promise<{ name: string; avatar: string; genre: string }[]>;
  searchAlbums(query: string): Promise<{ id: string; title: string; artist: string; coverArt: string }[]>;
}

// Built-in curated audio tracks with real playable audio sources (royalty-free preview audio links + Web Audio synth backup)
export const MOCK_TRACKS: Track[] = [
  {
    id: "track-1",
    title: "Midnight City Lights",
    artist: "Aether & Kael",
    album: "Neon Horizons",
    coverArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop",
    duration: 215,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3",
    genre: "Synthwave",
    releaseYear: 2024,
  },
  {
    id: "track-2",
    title: "Starlight Coffee (Lo-Fi)",
    artist: "Luna Chill",
    album: "Rainy Cafe Sessions",
    coverArt: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop",
    duration: 184,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7315b.mp3?filename=lofi-study-112191.mp3",
    genre: "Lo-Fi",
    releaseYear: 2024,
  },
  {
    id: "track-3",
    title: "Anbae Indha Parvai",
    artist: "Varun & Ananya",
    album: "Tamil Indie Acoustic",
    coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
    duration: 240,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitars-11881.mp3",
    genre: "Tamil Indie",
    releaseYear: 2024,
  },
  {
    id: "track-4",
    title: "Cyber Neon Sunset",
    artist: "Synthwave Dreams",
    album: "Retrofuturism Vol 2",
    coverArt: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop",
    duration: 198,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7f457.mp3?filename=neon-lights-123284.mp3",
    genre: "EDM",
    releaseYear: 2025,
  },
  {
    id: "track-5",
    title: "Velvet Sky (Acoustic)",
    artist: "The Midnight Trio",
    album: "Unplugged Under Stars",
    coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
    duration: 228,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=relaxing-acoustic-119330.mp3",
    genre: "Acoustic Pop",
    releaseYear: 2024,
  },
  {
    id: "track-6",
    title: "Celestial Resonance",
    artist: "Cosmo Pulse",
    album: "Galactic Journey",
    coverArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
    duration: 260,
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c0c0e5a953.mp3?filename=ambient-space-125432.mp3",
    genre: "Ambient",
    releaseYear: 2024,
  }
];

export class VibeSpaceMusicProvider implements MusicProvider {
  private tracks: Track[] = MOCK_TRACKS;

  async searchTracks(query: string, options?: MusicSearchOptions): Promise<Track[]> {
    if (!query) return this.tracks.slice(0, options?.limit || 10);
    const q = query.toLowerCase();
    let filtered = this.tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q)
    );
    if (options?.genre) {
      filtered = filtered.filter((t) => t.genre?.toLowerCase() === options.genre?.toLowerCase());
    }
    return filtered.slice(0, options?.limit || 10);
  }

  async getTrack(id: string): Promise<Track | null> {
    return this.tracks.find((t) => t.id === id) || null;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return null;
  }

  async getPlaybackSource(trackId: string): Promise<string> {
    const track = await this.getTrack(trackId);
    return track ? track.audioUrl : "";
  }

  async getPreview(trackId: string): Promise<string> {
    return this.getPlaybackSource(trackId);
  }

  async searchArtists(query: string): Promise<{ name: string; avatar: string; genre: string }[]> {
    return [
      { name: "Aether & Kael", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", genre: "Synthwave" },
      { name: "Luna Chill", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", genre: "Lo-Fi" },
      { name: "Varun & Ananya", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", genre: "Tamil Indie" },
    ];
  }

  async searchAlbums(query: string): Promise<{ id: string; title: string; artist: string; coverArt: string }[]> {
    return [
      { id: "alb-1", title: "Neon Horizons", artist: "Aether & Kael", coverArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300" },
      { id: "alb-2", title: "Rainy Cafe Sessions", artist: "Luna Chill", coverArt: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300" },
    ];
  }
}

export const defaultMusicProvider = new VibeSpaceMusicProvider();
