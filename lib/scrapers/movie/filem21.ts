import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://tv13.filem21.net/';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
];

let uaIndex = 0;

function getHeaders(ref?: string) {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'Referer': ref || BASE_URL,
    'Sec-Ch-Ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
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

function buildResponse<T>(page: string, url: string, data: T) {
  return {
    creator: 'rynaqrtz',
    page,
    url,
    ...(typeof data === 'object' && data !== null ? data : { data }),
  };
}

function clean<T>(obj: T): T {
  if (obj === null || obj === undefined) return undefined as any;
  if (Array.isArray(obj)) return obj.map(i => clean(i)).filter(i => i !== undefined) as any;
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = clean((obj as any)[key]);
      if (val !== undefined) result[key] = val;
    }
    return Object.keys(result).length ? result : undefined;
  }
  return obj;
}

export default class Filem21Scraper {
  private baseUrl = BASE_URL;
  private creator = 'rynaqrtz';

  private parseList($: cheerio.CheerioAPI) {
    const items: any[] = [];
    $('#gmr-main-load article').each((_, element) => {
      const $el = $(element);
      const titleElement = $el.find('.entry-title a');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      const image = $el.find('.content-thumbnail img').attr('src');
      const rating = $el.find('.gmr-rating-item').text().replace(/[\s\n\t]/g, '').trim();
      const type = $el.find('.gmr-posttype-item').text().trim() || 'Movie';
      const episode = $el.find('.gmr-numbeps span').text().trim() || null;
      const duration = $el.find('.gmr-duration-item').text().replace(/[\s\n\t]/g, '').trim() || null;
      const quality = $el.find('.gmr-quality-item a').text().trim() || null;

      const genres_countries: string[] = [];
      $el.find('.gmr-movie-on a').each((_, a) => {
        genres_countries.push($(a).text().trim());
      });

      if (title && link) {
        items.push({
          title,
          url: link.startsWith('http') ? link : this.baseUrl + link,
          poster: image || null,
          rating: rating || null,
          type,
          episode,
          duration,
          quality,
          genres_countries,
        });
      }
    });
    return items;
  }

  private parsePagination($: cheerio.CheerioAPI) {
    const pages = $('.page-numbers').not('.next');
    const last = pages.last().text().trim();
    const total = parseInt(last) || 1;
    return { total };
  }

  async home(page = 1) {
    const url = page === 1 ? this.baseUrl : this.baseUrl + `page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = this.parseList($);
    const pagination = this.parsePagination($);
    return buildResponse('home', url, { pagination, items });
  }

  async search(query: string, page = 1) {
    const url = page === 1
      ? this.baseUrl + `?s=${encodeURIComponent(query)}&post_type%5B%5D=post&post_type%5B%5D=tv`
      : this.baseUrl + `page/${page}/?s=${encodeURIComponent(query)}&post_type%5B%5D=post&post_type%5B%5D=tv`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = this.parseList($);
    const pagination = this.parsePagination($);
    return buildResponse('search', url, { query, pagination, items });
  }

  async genre(slug: string, page = 1) {
    const url = page === 1
      ? this.baseUrl + `genre/${slug}/`
      : this.baseUrl + `genre/${slug}/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = this.parseList($);
    const pagination = this.parsePagination($);
    return buildResponse('genre', url, { slug, pagination, items });
  }

  async country(slug: string, page = 1) {
    const url = page === 1
      ? this.baseUrl + `country/${slug}/`
      : this.baseUrl + `country/${slug}/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = this.parseList($);
    const pagination = this.parsePagination($);
    return buildResponse('country', url, { slug, pagination, items });
  }

  async detail(slugOrUrl: string) {
    const url = slugOrUrl.startsWith('http') ? slugOrUrl : this.baseUrl + slugOrUrl;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const title = $('.entry-title').text().trim() || '';
    const poster = $('.gmr-movie-data figure img').attr('src') || '';
    const posterFull = poster.replace(/-60x90/, '');

    let trailer = '';
    const trailerPopup = $('.gmr-trailer-popup').attr('href');
    const embedIframe = $('.gmr-embed-responsive iframe').attr('src');
    if (trailerPopup) trailer = trailerPopup;
    else if (embedIframe) trailer = embedIframe;

    const rating = $('span[itemprop="ratingValue"]').text().trim() || '';
    const ratingCount = $('span[itemprop="ratingCount"]').text().trim() || '';

    let synopsis = $('.entry-content .gtx-body').text().trim() || $('.entry-content p').first().text().trim() || '';
    if (!synopsis) {
      synopsis = $('.entry-content').text().trim().slice(0, 500);
    }

    const metadata: Record<string, string> = {};
    $('.gmr-moviedata').each((_, el) => {
      const $el = $(el);
      const labelRaw = $el.find('strong').text().trim();
      if (labelRaw) {
        const label = labelRaw.replace(':', '').trim();
        const values: string[] = [];
        $el.find('a, span, time').each((_, innerEl) => {
          const text = $(innerEl).text().trim();
          if (text && !$(innerEl).has('a').length && innerEl.tagName !== 'span') {
            values.push(text);
          } else if (innerEl.tagName === 'span' && !$(innerEl).find('a').length) {
            values.push(text);
          }
        });
        if (values.length === 0) {
          const rawText = $el.text().replace(labelRaw, '').replace(/[\n\t]/g, '').trim();
          if (rawText) metadata[label] = rawText;
        } else {
          const val = values.map(v => v.trim()).filter(v => v !== '').join(', ').replace(/,\s*,/g, ',');
          if (val) metadata[label] = val;
        }
      }
    });

    const tags: string[] = [];
    $('.tags-links-content a').each((_, el) => {
      tags.push($(el).text().trim());
    });

    const episodes: any[] = [];
    $('.gmr-listseries a').each((_, el) => {
      const $el = $(el);
      const epTitle = $el.text().trim();
      const epLink = $el.attr('href');
      const isAllSeries = $el.hasClass('gmr-all-serie') || $el.hasClass('button-shadow');
      if (epTitle && !isAllSeries && epLink) {
        episodes.push({
          title: epTitle,
          url: epLink.startsWith('http') ? epLink : this.baseUrl + epLink,
        });
      }
    });

    const downloads: any[] = [];
    $('.gmr-download-list li a').each((_, el) => {
      const $el = $(el);
      const label = $el.text().replace(/[\n\t]/g, '').trim();
      const link = $el.attr('href');
      if (link) downloads.push({ label, url: link });
    });

    const streams: any[] = [];
    const postId = $('#muvipro_player_content_id').attr('data-id');

    if (postId) {
      for (let i = 1; i <= 8; i++) {
        try {
          const formData = new URLSearchParams();
          formData.append('action', 'muvipro_player_content');
          formData.append('tab', `p${i}`);
          formData.append('post_id', postId);

          const response = await axios({
            url: `${this.baseUrl}wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: {
              ...getHeaders(url),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: formData.toString(),
          });

          const html = response.data;
          const $ajax = cheerio.load(html);
          const iframeSrc = $ajax('iframe').attr('src');

          if (iframeSrc) {
            const serverName = $(`#player${i}`).text().trim() || `Server ${i}`;
            streams.push({
              server: serverName,
              url: iframeSrc.startsWith('//') ? 'https:' + iframeSrc : iframeSrc,
            });
          }
        } catch (err) {
          continue;
        }
      }
    }

    const recommended: any[] = [];

    return clean({
      creator: this.creator,
      page: 'detail',
      url,
      title,
      poster: posterFull,
      trailer,
      rating,
      rating_count: ratingCount,
      synopsis,
      metadata,
      tags,
      episodes,
      downloads,
      streams,
      recommended,
    });
  }

  async watch(slugOrUrl: string) {
    const detail = await this.detail(slugOrUrl);
    return {
      creator: detail.creator,
      page: 'watch',
      url: detail.url,
      title: detail.title,
      poster: detail.poster,
      streams: detail.streams,
      downloads: detail.downloads,
      episodes: detail.episodes,
    };
  }
}
