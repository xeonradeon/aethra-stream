export interface ScraperItem {
  title: string;
  url: string;
  poster?: string | null;
  type?: string | null;
  status?: string | null;
  episode?: string | null;
  rating?: string | number | null;
  synopsis?: string | null;
  genres?: string[];
  releaseDate?: string | null;
}

export interface Pagination {
  current: number;
  total: number | null;
  hasNext: boolean;
  next?: string | null;
}

export interface ScraperResponse<T = any> {
  creator: string;
  page: string;
  url: string;
  data: T;
  pagination?: Pagination;
}

export interface DonghubItem extends ScraperItem {
}

export interface Cinema21Item extends ScraperItem {
  quality?: string;
  duration?: string;
  genres_countries?: string[];
}

export interface KomikindoItem extends ScraperItem {
  format?: string;
  latestChapter?: string;
  latestChapterTitle?: string;
  date?: string;
}

export interface MoviekuItem extends ScraperItem {
}

export interface SamehadakuItem extends ScraperItem {
  score?: string;
  sinopsis?: string;
}

export interface Episode {
  episode: string;
  title: string;
  url: string;
  releaseDate?: string | null;
}

export interface Stream {
  server: string;
  url: string;
  resolution?: string;
  type?: string;
}

export interface DownloadLink {
  label: string;
  url: string;
  episode?: number;
  resolution?: string;
  batch?: boolean;
}

export interface Navigation {
  prev: string | null;
  next: string | null;
  all: string | null;
}

export interface DetailData {
  title: string;
  poster: string | null;
  rating: string | number | null;
  synopsis: string | null;
  genres: string[];
  info: Record<string, string>;
  episodes: Episode[];
  recommended: ScraperItem[];
}

export interface EpisodeData {
  title: string;
  poster: string | null;
  synopsis: string | null;
  genres: string[];
  streams: Stream[];
  downloads: any[];
  nav: Navigation;
  otherEpisodes: Episode[];
}

export type ScraperType = 'donghub' | 'cinema21' | 'komikindo' | 'movieku' | 'samehadaku';
