import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://v2.samehadaku.how';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

let uaIndex = 0;

function getHeaders(ref?: string) {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  const isMobile = /Mobile|iPhone|Android/.test(ua);
  const platform = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : 'Linux';
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': ref || BASE_URL + '/',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Sec-Ch-Ua': `"${ua.includes('Chrome') ? 'Google Chrome' : 'Chromium'}"`,
    'Sec-Ch-Ua-Mobile': isMobile ? '?1' : '?0',
    'Sec-Ch-Ua-Platform': `"${platform}"`,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
  };
}

function randomDelay(min = 300, max = 800) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

async function fetchHTML(url: string, retries = 5, ref?: string): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      await randomDelay(300, 800);
      const res = await axios({
        url,
        method: 'GET',
        headers: getHeaders(ref || url),
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
        maxRedirects: 5,
        decompress: true,
        validateStatus: status => status >= 200 && status < 400,
      });
      return res.data;
    } catch (e) {
      if (i < retries - 1) await randomDelay(1500, 4000);
      else throw e;
    }
  }
  throw new Error('Gagal fetch setelah retry');
}

export default class SamehadakuScraper {
  private base = BASE_URL;
  private creator = 'rynaqrtz';

  private clean<T>(obj: T): T {
    if (obj === null || obj === undefined) return undefined as any;
    if (Array.isArray(obj)) return obj.map(i => this.clean(i)) as any;
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key of Object.keys(obj as any)) {
        const val = this.clean((obj as any)[key]);
        if (val !== undefined) result[key] = val;
      }
      return Object.keys(result).length ? result : undefined;
    }
    return obj;
  }

  private parseCardHome($: cheerio.CheerioAPI, element: cheerio.Element) {
    const $el = $(element);
    const link = $el.find('a').first().attr('href');
    const title = $el.find('.dtla h2 a, .entry-title a').text().trim() || $el.find('.title h2').text().trim();
    const poster = $el.find('.thumb img, .anmsa').attr('src') || null;
    const episode = $el.find('.dtla span author, .dtla b').first().text().trim() || null;
    const author = $el.find('.dtla .author author').text().trim() || null;
    const dateRaw = $el.find('.dtla span .dashicons-calendar').parent().text().trim();
    const date = dateRaw.replace('Released on:', '').trim() || null;
    const type = $el.find('.type').first().text().trim() || null;
    const status = $el.find('.type').eq(1).text().trim() || null;
    const rating = $el.find('.score, .rating .fa-star').parent().text().trim() || null;

    if (!link || !title) return null;

    return {
      title,
      url: link.startsWith('http') ? link : this.base + link,
      poster,
      episode,
      author,
      date,
      type,
      status,
      rating,
    };
  }

  private parseCardCatalog($: cheerio.CheerioAPI, element: cheerio.Element) {
    const $el = $(element);
    const link = $el.find('a').first().attr('href');
    const title = $el.find('.title h2').first().text().trim();
    const poster = $el.find('.content-thumb img, .anmsa').attr('src') || null;
    const type = $el.find('.type').first().text().trim() || null;
    const status = $el.find('.type').eq(1).text().trim() || $el.find('.data .type').text().trim() || null;
    const rating = $el.find('.score').text().trim() || null;
    const sinopsis = $el.find('.stooltip .ttls').text().trim() || null;
    const genres: string[] = [];
    $el.find('.stooltip .genres .mta a, .genre-info a').each((_, a) => {
      const g = $(a).text().trim();
      if (g) genres.push(g);
    });

    if (!link || !title) return null;

    return {
      title,
      url: link.startsWith('http') ? link : this.base + link,
      poster,
      type,
      status,
      rating,
      sinopsis,
      genres,
    };
  }

  private parsePagination($: cheerio.CheerioAPI) {
    const result = { current: 1, next: null, hasNext: false, total: null };
    const pageLinks: { text: string; href: string }[] = [];
    $('.pagination a, .pagination span, .page-numbers').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href) pageLinks.push({ text, href });
    });
    const numbers = pageLinks.filter(l => /^\d+$/.test(l.text)).map(l => parseInt(l.text));
    if (numbers.length) result.total = Math.max(...numbers);
    const current = $('.pagination .page-numbers.current').first();
    if (current.length) {
      const t = current.text().trim();
      if (/^\d+$/.test(t)) result.current = parseInt(t);
    }
    if (result.total && result.current < result.total) {
      result.hasNext = true;
      const nextLink = pageLinks.find(l => l.text === 'Next' || l.text === '»' || l.text.toLowerCase().includes('next'));
      if (nextLink && nextLink.href) {
        result.next = nextLink.href.startsWith('http') ? nextLink.href : this.base + nextLink.href;
      }
    }
    return result;
  }

  private parseEpisodeList($: cheerio.CheerioAPI) {
    const episodes: { episode: string; title: string; url: string; releaseDate: string | null }[] = [];
    const seenUrls = new Set<string>();
    const seenEpisodeNumbers = new Set<string>();

    $('.lstepsiode.listeps ul li, .listeps ul li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.lchx a').attr('href');
      const rawTitle = $el.find('.lchx a').text().trim();
      const episodeNumRaw = $el.find('.eps a, .eps').text().trim() || null;
      const date = $el.find('.date').text().trim() || null;

      if (!link || !rawTitle) return;

      if (seenUrls.has(link)) return;
      seenUrls.add(link);

      let episodeNum = '0';
      if (episodeNumRaw) {
        const match = episodeNumRaw.match(/(?:Episode|Ep|Eps)\s*(\d+)/i);
        if (match) {
          episodeNum = match[1];
        } else {
          const numMatch = episodeNumRaw.match(/\d+/);
          if (numMatch) {
            episodeNum = numMatch[0];
          } else {
            episodeNum = episodeNumRaw;
          }
        }
      }

      if (seenEpisodeNumbers.has(episodeNum)) return;
      seenEpisodeNumbers.add(episodeNum);

      const title = rawTitle.replace(/Episode\s*\d+/i, '').trim();

      episodes.push({
        episode: episodeNum || '0',
        title: title || rawTitle,
        url: link.startsWith('http') ? link : this.base + link,
        releaseDate: date || null,
      });
    });

    return episodes.sort((a, b) => {
      const aNum = parseInt(a.episode);
      const bNum = parseInt(b.episode);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.episode.localeCompare(b.episode);
    });
  }

  private parseSchedule($: cheerio.CheerioAPI) {
    const schedule: any[] = [];
    $('.result-schedule .animepost').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.animposx a').attr('href');
      const title = $el.find('.title').text().trim();
      const poster = $el.find('.content-thumb img').attr('src') || null;
      const type = $el.find('.type').text().trim() || null;
      const score = $el.find('.score').text().trim() || null;
      const genre = $el.find('.type:last-child').text().trim() || null;
      const time = $el.find('.data_tw .ltseps').text().trim() || null;
      if (link && title) {
        schedule.push({
          title,
          url: link.startsWith('http') ? link : this.base + link,
          poster,
          type,
          score,
          genre,
          time,
        });
      }
    });
    return schedule;
  }

  private buildResponse<T>(page: string, url: string, data: T) {
    return this.clean({
      creator: this.creator,
      page,
      url,
      data,
    });
  }

  private buildStreams(downloads: any[]) {
    const resolutionPriority = ['FULLHD', '1080p', 'MP4HD', '720p', '480p', '360p'];
    if (!downloads || !Array.isArray(downloads)) return [];
    let bestStream = null;
    let bestResolution = '';
    downloads.forEach(dl => {
      if (!dl || !dl.mirrors || !Array.isArray(dl.mirrors)) return;
      const resolution = dl.resolution || '';
      const aceFileMirror = dl.mirrors.find((m: any) => 
        m.url.includes('acefile.co') || m.name?.toLowerCase().includes('acefile')
      );
      if (aceFileMirror) {
        const currentResolutionIndex = resolutionPriority.indexOf(resolution);
        const bestResolutionIndex = resolutionPriority.indexOf(bestResolution);
        if (bestStream === null || 
            (currentResolutionIndex !== -1 && bestResolutionIndex !== -1 && currentResolutionIndex < bestResolutionIndex) ||
            (currentResolutionIndex !== -1 && bestResolutionIndex === -1)) {
          bestStream = {
            server: 'AceFile',
            url: aceFileMirror.url,
            resolution: resolution,
          };
          bestResolution = resolution;
        }
      }
    });
    return bestStream ? [bestStream] : [];
  }

  async home(page = 1) {
    const url = page === 1 ? this.base + '/' : this.base + `/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const top10: any[] = [];
    $('.widget-post .topten-animesu ul li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.series').attr('href');
      const title = $el.find('.series .judul').text().trim();
      const poster = $el.find('.series img').attr('src') || null;
      const rating = $el.find('.series .rating').text().replace(/[^\d.]/g, '').trim() || null;
      const rank = $el.find('.series .is-topten b:last-child').text().trim() || null;
      const episode = $el.find('.series .episode').text().trim() || null;
      if (link && title) {
        top10.push({
          title,
          url: link.startsWith('http') ? link : this.base + link,
          poster,
          rating,
          rank,
          episode,
        });
      }
    });

    const items: any[] = [];
    $('.post-show ul li, .widget-post .post-show ul li').each((_, el) => {
      const card = this.parseCardHome($, el);
      if (card) items.push(card);
    });

    const pagination = this.parsePagination($);

    return this.buildResponse('home', url, { top10, pagination, items });
  }

  async terbaru(page = 1) {
    const url = page === 1 ? this.base + '/anime-terbaru/' : this.base + `/anime-terbaru/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.post-show ul li').each((_, el) => {
      const card = this.parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = this.parsePagination($);
    return this.buildResponse('terbaru', url, { pagination, items });
  }

  async catalog(page = 1, filters: any = {}) {
    let basePath = '/daftar-anime-2/';
    if (page > 1) basePath = `/daftar-anime-2/page/${page}/`;
    let url = this.base + basePath;
    const params = new URLSearchParams();
    if (filters.title) params.set('title', filters.title);
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type || '');
    if (filters.order) params.set('order', filters.order);
    if (filters.genre && filters.genre.length) {
      filters.genre.forEach((g: string) => params.append('genre[]', g));
    }
    const query = params.toString();
    if (query) url += '?' + query;

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.relat .animpost').each((_, el) => {
      const card = this.parseCardCatalog($, el);
      if (card) items.push(card);
    });
    const pagination = this.parsePagination($);
    return this.buildResponse('catalog', url, { filters, pagination, items });
  }

  async ongoing(page = 1) {
    return this.catalog(page, { status: 'Currently Airing', order: 'title' });
  }

  async completed(page = 1) {
    return this.catalog(page, { status: 'Finished Airing', order: 'title' });
  }

  async batch(page = 1) {
    const url = page === 1 ? this.base + '/daftar-batch/' : this.base + `/daftar-batch/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.relat .animpost').each((_, el) => {
      const card = this.parseCardCatalog($, el);
      if (card) items.push(card);
    });
    const pagination = this.parsePagination($);
    return this.buildResponse('batch', url, { pagination, items });
  }

  async search(query: string, page = 1) {
    const url = page === 1 ? this.base + `/?s=${encodeURIComponent(query)}` : this.base + `/page/${page}/?s=${encodeURIComponent(query)}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.relat .animpost').each((_, el) => {
      const card = this.parseCardCatalog($, el);
      if (card) items.push(card);
    });
    const pagination = this.parsePagination($);
    return this.buildResponse('search', url, { query, pagination, items });
  }

  async detail(slug: string) {
    const url = this.base + `/anime/${slug}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const title = $('h1.entry-title').first().text().trim();
    const poster = $('.infoanime .thumb img, .thumb-batch img').attr('src') || null;
    const rating = $('.infoanime .thumb .rating-area').text().trim() || null;
    const synopsis = $('.infoanime .infox .desc .entry-content p').map((_, el) => $(el).text().trim()).get().join('\n');

    const genres: string[] = [];
    $('.infoanime .infox .genre-info a, .genre-info a').each((_, el) => {
      const g = $(el).text().trim();
      if (g) genres.push(g);
    });

    const info: Record<string, string> = {};
    $('.infoanime .infox .spe span, .infoanime .spe span').each((_, el) => {
      const text = $(el).text().trim();
      const parts = text.split(/\s+/);
      if (parts.length > 1) {
        const key = parts[0].replace(':', '').toLowerCase();
        const value = parts.slice(1).join(' ');
        info[key] = value;
      }
    });

    const episodes = this.parseEpisodeList($);

    const recommended: any[] = [];
    $('.widget-post .rand-animesu ul li, .widgetpost .rand-animesu ul li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.series').attr('href');
      const titleRec = $el.find('.series .judul').text().trim();
      const posterRec = $el.find('.series img').attr('src') || null;
      const ratingRec = $el.find('.series .rating').text().replace(/[^\d.]/g, '').trim() || null;
      const episodeRec = $el.find('.series .episode').text().trim() || null;
      if (link && titleRec) {
        recommended.push({
          title: titleRec,
          url: link.startsWith('http') ? link : this.base + link,
          poster: posterRec,
          rating: ratingRec,
          episode: episodeRec,
        });
      }
    });

    return this.buildResponse('detail', url, {
      title,
      poster,
      rating,
      synopsis,
      genres,
      info,
      episodes,
      recommended: recommended.slice(0, 10),
    });
  }

  async episode(slug: string) {
    let url: string;
    if (slug.includes('http')) {
      url = slug;
    } else {
      if (slug.includes('-episode-')) {
        url = this.base + `/${slug}/`;
      } else {
        url = this.base + `/${slug}/`;
      }
    }

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const title = $('h1.entry-title').text().trim();
    const poster = $('.infoanime .thumb img, .thumb-batch img').attr('src') || null;
    const synopsis = $('.entry-content-single').text().trim();
    const genres: string[] = [];
    $('.genre-info a').each((_, el) => {
      const g = $(el).text().trim();
      if (g) genres.push(g);
    });

    const downloads: any[] = [];
    const processedUrls = new Set();
    $('.download-eps ul li').each((_, el) => {
      const $el = $(el);
      const resolution = $el.find('strong').text().trim() || 'Unknown';
      const mirrors: any[] = [];
      $el.find('span a, a[href]').each((_, a) => {
        const href = $(a).attr('href');
        const name = $(a).text().trim() || 'Link';
        if (href && href.length > 5 && !processedUrls.has(href)) {
          processedUrls.add(href);
          let server = 'Link';
          if (href.includes('acefile.co') || name.toLowerCase().includes('acefile')) server = 'AceFile';
          else if (href.includes('pixeldrain.com') || name.toLowerCase().includes('pixeldrain')) server = 'PixelDrain';
          else if (href.includes('mediafire.com') || name.toLowerCase().includes('mediafire')) server = 'MediaFire';
          else if (href.includes('gofile.io') || name.toLowerCase().includes('gofile')) server = 'Gofile';
          else if (href.includes('krakenfiles.com') || name.toLowerCase().includes('krakenfiles')) server = 'Krakenfiles';
          mirrors.push({ name: server, url: href });
        }
      });
      if (resolution && mirrors.length > 0) {
        downloads.push({ resolution, mirrors });
      }
    });

    if (downloads.length === 0) {
      $('.download a[href], .mirrorstream a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const name = $(el).text().trim() || 'Link';
        if (href && href.length > 5 && !processedUrls.has(href)) {
          processedUrls.add(href);
          let server = 'Link';
          if (href.includes('acefile.co') || name.toLowerCase().includes('acefile')) server = 'AceFile';
          else if (href.includes('pixeldrain.com') || name.toLowerCase().includes('pixeldrain')) server = 'PixelDrain';
          else if (href.includes('mediafire.com') || name.toLowerCase().includes('mediafire')) server = 'MediaFire';
          else if (href.includes('gofile.io') || name.toLowerCase().includes('gofile')) server = 'Gofile';
          else if (href.includes('krakenfiles.com') || name.toLowerCase().includes('krakenfiles')) server = 'Krakenfiles';
          const resolution = $(el).closest('li').find('strong').text().trim() || 'Unknown';
          const existing = downloads.find((d: any) => d.resolution === resolution);
          if (existing) {
            if (!existing.mirrors.find((m: any) => m.url === href)) {
              existing.mirrors.push({ name: server, url: href });
            }
          } else {
            downloads.push({ resolution, mirrors: [{ name: server, url: href }] });
          }
        }
      });
    }

    const streams = this.buildStreams(downloads);

    const otherEpisodes = this.parseEpisodeList($);

    const nav = {
      prev: $('.naveps .nvs:first-child a').attr('href') || null,
      all: $('.naveps .nvsc a').attr('href') || null,
      next: $('.naveps .nvs:last-child a').attr('href') || null,
    };

    const data: any = {
      title,
      poster,
      synopsis,
      genres,
      streams,
      downloads,
      nav,
    };
    if (otherEpisodes && otherEpisodes.length > 0) {
      data.otherEpisodes = otherEpisodes;
    }

    return this.buildResponse('episode', url, data);
  }

  async genre(slug: string, page = 1) {
    let basePath = `/genre/${slug}/`;
    if (page > 1) basePath = `/genre/${slug}/page/${page}/`;
    const url = this.base + basePath;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.relat .animpost').each((_, el) => {
      const card = this.parseCardCatalog($, el);
      if (card) items.push(card);
    });
    const pagination = this.parsePagination($);
    return this.buildResponse('genre', url, { slug, pagination, items });
  }

  async schedule() {
    const url = this.base + '/jadwal-rilis/';
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const schedule = this.parseSchedule($);
    return this.buildResponse('schedule', url, { schedule });
  }

  async movie(page = 1) {
    const url = this.base + '/anime-movie/';
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items: any[] = [];
    $('.relat .animpost').each((_, el) => {
      const card = this.parseCardCatalog($, el);
      if (card) items.push(card);
    });
    const pagination = this.parsePagination($);
    return this.buildResponse('movie', url, { pagination, items });
  }
}
