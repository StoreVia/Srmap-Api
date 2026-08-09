export interface OptionItem {
  name: string;
  code?: string;
  url?: string;
}

export interface StreamSegmentConfig {
  prefixCode?: string;
  startSegment?: number;
  endSegment?: number;
  segmentPadding?: number;
  segmentFile?: string;
}

export interface StreamConfig {
  video?: StreamSegmentConfig;
  audio?: StreamSegmentConfig;
}

export interface StreamOptions {
  video?: OptionItem[];
  audio?: OptionItem[];
  subtitles?: OptionItem[];
}

export interface EpisodeDefaults {
  video?: string;
  audio?: string;
}

export interface EpisodeData {
  name: string;
  description?: string;
  streamCdn?: string;
  cdnId?: string;
  defaults?: EpisodeDefaults;
  streamConfig?: StreamConfig;
  stream?: StreamOptions;
}

export interface SeasonData {
  name: string;
  description?: string;
  episodes: EpisodeData[];
}

export interface MediaFormData {
  Name: string;
  Slug: string;
  type: "movie" | "series" | "short-film";
  posterUrl?: string;
  heroUrl?: string;
  description?: string;
  featured?: boolean;
  featuredOrder?: number;
  categories?: string[];
  streamCdn?: string;
  cdnId?: string;
  defaults?: EpisodeDefaults;
  streamConfig?: StreamConfig;
  stream?: StreamOptions;
  season?: SeasonData[];
}

export const DEFAULT_STREAM_CONFIG: StreamConfig = {
  video: { prefixCode: "1065", startSegment: 0, endSegment: 760, segmentPadding: 3 },
  audio: { prefixCode: "1065", startSegment: 0, endSegment: 760, segmentPadding: 3 },
};

export const DEFAULT_STREAM: StreamOptions = {
  video: [
    { name: "Full HD (1080p)", code: "1080p" },
    { name: "HD (720p)", code: "720p" },
    { name: "SD (480p)", code: "480p" },
  ],
  audio: [
    { name: "English", code: "0" },
    { name: "Spanish", code: "1" },
    { name: "Telugu", code: "2" },
    { name: "Hindi", code: "3" },
  ],
  subtitles: [{ name: "English", url: "", code: "" }],
};

export const DEFAULT_EPISODE: EpisodeData = {
  name: "Episode 1",
  description: "Episode description...",
  streamCdn: "https://s12.freecdn32z.top",
  cdnId: "0Q4MOZ3KTZ5GPFMD8TI020XVSM",
  defaults: { video: "720p", audio: "3" },
  streamConfig: JSON.parse(JSON.stringify(DEFAULT_STREAM_CONFIG)),
  stream: JSON.parse(JSON.stringify(DEFAULT_STREAM)),
};

export const DEFAULT_FORM_DATA: MediaFormData = {
  Name: "",
  Slug: "",
  type: "movie",
  posterUrl: "",
  heroUrl: "",
  description: "",
  featured: false,
  featuredOrder: 0,
  categories: [],
  streamCdn: "https://s15.freecdn13.top",
  cdnId: "0KEKSUA04N2G90A8JKW6FO725I",
  defaults: { video: "720p", audio: "0" },
  streamConfig: JSON.parse(JSON.stringify(DEFAULT_STREAM_CONFIG)),
  stream: JSON.parse(JSON.stringify(DEFAULT_STREAM)),
  season: [
    {
      name: "Season 1",
      description: "Season 1 description...",
      episodes: [JSON.parse(JSON.stringify(DEFAULT_EPISODE))],
    },
  ],
};