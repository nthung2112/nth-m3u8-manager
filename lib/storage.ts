import type { M3U8Playlist } from "./types";

const STORAGE_KEY = "m3u8_playlists";

export function getPlaylists(): M3U8Playlist[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const playlists = JSON.parse(stored);
    return playlists.map((playlist: any) => ({
      ...playlist,
      createdAt: new Date(playlist.createdAt),
      updatedAt: new Date(playlist.updatedAt),
    }));
  } catch (error) {
    console.error("Error loading playlists:", error);
    return [];
  }
}

export function savePlaylist(playlist: M3U8Playlist): void {
  if (typeof window === "undefined") return;

  try {
    const playlists = getPlaylists();
    const existingIndex = playlists.findIndex((p) => p.id === playlist.id);

    if (existingIndex >= 0) {
      playlists[existingIndex] = { ...playlist, updatedAt: new Date() };
    } else {
      playlists.push(playlist);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error("Error saving playlist:", error);
  }
}

export function deletePlaylist(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const playlists = getPlaylists().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  } catch (error) {
    console.error("Error deleting playlist:", error);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
