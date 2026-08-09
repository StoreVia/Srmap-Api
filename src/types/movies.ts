export interface StreamConfigDetail {
  prefixCode: string;
  startSegment: number;
  endSegment: number;
  segmentPadding: number;
  segmentFile?: string;
}

export interface StreamConfig {
  video: StreamConfigDetail;
  audio: StreamConfigDetail;
}

export interface OptionItem {
  name: string;
  code?: string;
  url?: string;
}

export interface StreamOptions {
  video: OptionItem[];
  audio: OptionItem[];
  subtitles: OptionItem[];
}

export interface DefaultsConfig {
  video: string;
  audio: string;
}

export interface Episode {
  name: string;
  description?: string;
  streamCdn: string;
  cdnId: string;
  defaults: DefaultsConfig;
  streamConfig: StreamConfig;
  stream: StreamOptions;
}

export interface Season {
  name: string;
  description?: string;
  episodes: Episode[];
}

export type MovieEpisode = Episode;

export interface Movie {
  _id?: string;
  Name: string;
  Slug: string;
  posterUrl?: string;
  heroUrl?: string;
  type: "movie" | "series";
  description?: string;
  featured?: boolean;
  featuredOrder?: number;
  categories?: string[];
  streamCdn?: string;
  cdnId?: string;
  defaults?: DefaultsConfig;
  streamConfig?: StreamConfig;
  stream?: StreamOptions;
  season?: Season[];
}