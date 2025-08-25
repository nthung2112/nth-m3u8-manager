export interface Channel {
  id: string;
  title: string;
  url: string;
  tvgId?: string;
  tvgLogo?: string;
  groupTitle?: string;
  catchup?: string;
  catchupDays?: string;
  catchupSource?: string;
  userAgent?: string;
  referrer?: string;
}

export interface PlaylistConfig {
  urlTvg?: string;
  tvgShift?: number;
  refresh?: string;
  cache?: number;
  interlace?: number;
  aspectRatio?: string;
  m3uAutoload?: number;
}

export interface M3U8Playlist {
  id: string;
  name: string;
  channels: Channel[];
  configs: PlaylistConfig[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedM3U8 {
  configs: PlaylistConfig[];
  channels: Omit<Channel, "id">[];
}
