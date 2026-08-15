import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://donghub.vip';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

let uaIndex = 0;

function randomDelay(min = 800, max = 2500) {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

function getHeaders(ref?: string) {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': ref || BASE_URL + '/',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
  };
}

async function fetchHTML(url: string, retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      await randomDelay(800, 2500);
      const response = await axios({
        url,
        method: 'GET',
        headers: getHeaders(url),
        timeout: 60000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
        maxRedirects: 5,
        decompress: true,
        validateStatus: status => status >= 200 && status < 400,
      });
      return response.data;
    } catch (e) {
      if (i < retries - 1) await randomDelay(3000, 6000);
      else throw new Error('Gagal fetch setelah retry');
    }
  }
  throw new Error('Gagal fetch setelah retry');
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

function buildResponse<T>(page: string, url: string, data: T) {
  return clean({
    creator: 'rynaqrtz',
    page,
    url,
    data,
  });
}

function parsePagination($: cheerio.CheerioAPI) {
  const result = { current: 1, next: null, hasNext: false, total: 0 };
  const nextLink = $('.hpage .r, .pagination .next, .page-numbers.next').first();
  if (nextLink.length) {
    const href = nextLink.attr('href');
    if (href) {
      result.hasNext = true;
      result.next = href.startsWith('http') ? href : BASE_URL + href;
    }
  }
  const pages = $('.hpage .page-numbers, .pagination .page-numbers').not('.next');
  if (pages.length) {
    const last = pages.last().text().trim();
    result.total = parseInt(last) || 0;
  }
  return result;
}

function parseCardHome($: cheerio.CheerioAPI, element: cheerio.Element) {
  const $el = $(element);
  const link = $el.find('.bsx a').attr('href');
  let rawTitle = $el.find('.tt').text().trim();
  const lines = rawTitle.split(/\s+/).filter(w => w.length > 0);
  if (lines.length > 4) {
    const half = Math.floor(lines.length / 2);
    const firstHalf = lines.slice(0, half).join(' ');
    const secondHalf = lines.slice(half).join(' ');
    if (firstHalf === secondHalf) rawTitle = firstHalf;
  }
  let title = rawTitle
    .replace(/Episode\s*\d+\s*Subtitle\s*Indonesia/gi, '')
    .replace(/Ep\s*\d+/gi, '')
    .replace(/Subtitle\s*Indonesia/gi, '')
    .replace(/\s*ONA\s*$/i, '')
    .trim();
  if (!title) title = rawTitle;
  const poster = $el.find('.limit img').attr('src') || null;
  const type = $el.find('.typez').text().trim() || $el.find('.eggtype').text().trim() || null;
  const episode = $el.find('.bt .epx').text().trim() || $el.find('.eggepisode').text().trim() || null;
  const sub = $el.find('.bt .sb').text().trim() || null;
  const hot = $el.find('.hotbadge').length > 0;
  if (!link || !title) return null;
  return {
    title,
    url: link.startsWith('http') ? link : BASE_URL + link,
    poster,
    type,
    episode,
    sub,
    hot,
    rating: null,
  };
}

function parseCardPopular($: cheerio.CheerioAPI, element: cheerio.Element) {
  const $el = $(element);
  const link = $el.find('.imgseries .series').attr('href');
  const title = $el.find('.leftseries h4 a').text().trim();
  const poster = $el.find('.imgseries img').attr('src') || null;
  const genres = [];
  $el.find('.leftseries span a').each((_, a) => {
    const g = $(a).text().trim();
    if (g) genres.push(g);
  });
  const rank = $el.find('.ctr').text().trim() || null;
  const rating = $el.find('.rt .numscore').text().trim() || null;
  if (!link || !title) return null;
  return {
    title,
    url: link.startsWith('http') ? link : BASE_URL + link,
    poster,
    genres,
    rank,
    rating,
  };
}

function parseCardRecommendation($: cheerio.CheerioAPI, element: cheerio.Element) {
  const $el = $(element);
  const link = $el.find('.bsx a').attr('href');
  let title = $el.find('.tt').text().trim();
  const lines = title.split(/\s+/).filter(w => w.length > 0);
  if (lines.length > 4) {
    const half = Math.floor(lines.length / 2);
    const firstHalf = lines.slice(0, half).join(' ');
    const secondHalf = lines.slice(half).join(' ');
    if (firstHalf === secondHalf) title = firstHalf;
  }
  title = title.replace(/\s*ONA\s*$/i, '').trim();
  const poster = $el.find('.limit img').attr('src') || null;
  const type = $el.find('.typez').text().trim() || null;
  const status = $el.find('.bt .epx').text().trim() || null;
  const sub = $el.find('.bt .sb').text().trim() || null;
  if (!link || !title) return null;
  return {
    title,
    url: link.startsWith('http') ? link : BASE_URL + link,
    poster,
    type,
    status,
    sub,
  };
}

function parseEpisodeList($: cheerio.CheerioAPI) {
  const episodes = [];
  $('.eplister ul li').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').attr('href');
    const title = $el.find('.epl-title').text().trim();
    const episodeNum = $el.find('.epl-num').text().trim() || null;
    const date = $el.find('.epl-date').text().trim() || null;
    if (link && title) {
      episodes.push({
        episode: episodeNum || '0',
        title,
        url: link.startsWith('http') ? link : BASE_URL + link,
        releaseDate: date || null,
      });
    }
  });
  return episodes;
}

export default class DonghuaScraper {
  private base = BASE_URL;
  private creator = 'rynaqrtz';

  async home(page = 1) {
    const url = page === 1 ? this.base + '/' : this.base + `/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const slider = [];
    $('#slidertwo .swiper-slide').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.info .watch').attr('href');
      const title = $el.find('.info h2 a').text().trim();
      const synopsis = $el.find('.info p').text().trim();
      const backdrop = $el.find('.backdrop').css('background-image')?.replace(/url\(['"]?(.*?)['"]?\)/, '$1') || null;
      if (link && title) {
        slider.push({
          title,
          url: link.startsWith('http') ? link : this.base + link,
          synopsis,
          backdrop,
        });
      }
    });
    const popular = [];
    $('.popularslider .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) popular.push(card);
    });
    const latest = [];
    $('.listupd.normal .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) latest.push(card);
    });
    const recommendation = {};
    $('.series-gen .tab-pane').each((_, el) => {
      const $el = $(el);
      const id = $el.attr('id');
      if (id) {
        const items = [];
        $el.find('.bs').each((_, itemEl) => {
          const card = parseCardRecommendation($, itemEl);
          if (card) items.push(card);
        });
        recommendation[id] = items;
      }
    });
    const pagination = parsePagination($);
    return buildResponse('home', url, {
      slider,
      popular,
      latest,
      recommendation,
      pagination,
    });
  }

  async ongoing(page = 1) {
    const url = this.base + `/anime/?status=ongoing&order=update${page > 1 ? `&page=${page}` : ''}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('ongoing', url, { pagination, items });
  }

  async completed(page = 1) {
    const url = this.base + `/anime/?status=completed&order=update${page > 1 ? `&page=${page}` : ''}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('completed', url, { pagination, items });
  }

  async schedule() {
    const url = this.base + '/schedule/';
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const schedule = {};
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const temp = {};
    $('.schedulepage').each((_, el) => {
      const $el = $(el);
      const dayClass = $el.attr('class')?.split(' ').find(c => c.startsWith('sch_'));
      if (dayClass) {
        const day = dayClass.replace('sch_', '');
        const items = [];
        $el.find('.listupd .bs').each((_, itemEl) => {
          const card = parseCardHome($, itemEl);
          if (card) items.push(card);
        });
        if (items.length) temp[day] = items;
      }
    });
    dayOrder.forEach(day => {
      if (temp[day]) schedule[day] = temp[day];
    });
    return buildResponse('schedule', url, { schedule });
  }

  async search(query: string, page = 1) {
    const url = this.base + `/?s=${encodeURIComponent(query)}${page > 1 ? `&page=${page}` : ''}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('search', url, { query, pagination, items });
  }

  async detail(slug: string) {
    let allEpisodes = [];
    let currentPage = 1;
    let hasNextPage = true;
    while (hasNextPage) {
      const url = currentPage === 1 ? this.base + `/${slug}/` : this.base + `/${slug}/page/${currentPage}/`;
      const html = await fetchHTML(url);
      const $ = cheerio.load(html);
      const pageEpisodes = parseEpisodeList($);
      allEpisodes = allEpisodes.concat(pageEpisodes);
      const nextLink = $('.hpage .r, .pagination .next, .page-numbers.next').first();
      if (nextLink.length) {
        const href = nextLink.attr('href');
        if (href) currentPage++;
        else hasNextPage = false;
      } else {
        hasNextPage = false;
      }
      await randomDelay(500, 1000);
    }
    const firstUrl = this.base + `/${slug}/`;
    const firstHtml = await fetchHTML(firstUrl);
    const $first = cheerio.load(firstHtml);
    const title = $first('.infox h1.entry-title').text().trim();
    const poster = $first('.bigcover .ime img').attr('src') || $first('.thumb img').attr('src') || null;
    const rating = $first('.bigcontent .rt .rating').text().trim() || null;
    const synopsis = $first('.synp .entry-content p').text().trim() || null;
    const genres = [];
    $first('.genxed a').each((_, el) => {
      const g = $first(el).text().trim();
      if (g) genres.push(g);
    });
    const info = {};
    $first('.infox .spe span').each((_, el) => {
      const text = $first(el).text().trim();
      const parts = text.split(':');
      if (parts.length > 1) {
        const key = parts[0].trim().toLowerCase();
        const value = parts.slice(1).join(':').trim();
        if (key && value) info[key] = value;
      }
    });
    const recommended = [];
    $first('.bixbox .listupd .bs').each((_, el) => {
      if (recommended.length < 10) {
        const card = parseCardRecommendation($first, el);
        if (card) recommended.push(card);
      }
    });
    allEpisodes.sort((a, b) => parseInt(a.episode) - parseInt(b.episode));
    return buildResponse('detail', firstUrl, {
      title,
      poster,
      rating,
      synopsis,
      genres,
      info,
      episodes: allEpisodes,
      recommended,
    });
  }

  async episode(slugOrUrl: string) {
    let url;
    if (slugOrUrl.includes('http')) {
      url = slugOrUrl;
    } else {
      const match = slugOrUrl.match(/^(.+?)-episode-(\d+)$/);
      if (match) {
        url = this.base + `/${slugOrUrl}/`;
      } else {
        throw new Error('Invalid format. Use slug-episode-number or full URL');
      }
    }
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const title = $('.entry-title').text().trim();
    const poster = $('.tb img').attr('src') || null;
    const synopsis = $('.entry-content .infx p').text().trim() || null;
    const genres = [];
    $('.genxed a').each((_, el) => {
      const g = $(el).text().trim();
      if (g) genres.push(g);
    });
    const streams = [];
    const selectOptions = $('.mirror option');
    selectOptions.each((_, el) => {
      const value = $(el).val();
      const label = $(el).text().trim();
      if (value && typeof value === 'string' && value.length > 0 && label !== 'Select Video Server') {
        try {
          const decoded = Buffer.from(value, 'base64').toString('utf-8');
          const srcMatch = decoded.match(/src=["']([^"']+)["']/);
          if (srcMatch) {
            let streamUrl = srcMatch[1];
            if (streamUrl.startsWith('//')) {
              streamUrl = 'https:' + streamUrl;
            }
            if (streamUrl.includes('ok.ru') || streamUrl.includes('ok.ru/videoembed')) {
              if (!streamUrl.includes('/videoembed/')) {
                const idMatch = streamUrl.match(/ok\.ru\/video\/(\d+)/);
                if (idMatch) {
                  streamUrl = `https://ok.ru/videoembed/${idMatch[1]}`;
                }
              }
            }
            if (streamUrl.includes('mega.nz') || streamUrl.includes('mega.co.nz')) {
              const idMatch = streamUrl.match(/mega\.nz\/#!([^!]+)!/);
              if (idMatch) {
                streamUrl = `https://mega.nz/embed/#!${idMatch[1]}!`;
              }
            }
            streams.push({
              server: label,
              url: streamUrl,
            });
          }
        } catch (e) {
          if (typeof value === 'string' && value.startsWith('http')) {
            streams.push({
              server: label,
              url: value,
            });
          }
        }
      }
    });
    const nav = {
      prev: $('.naveps .nvs:first-child a').attr('href') || null,
      all: $('.naveps .nvsc a').attr('href') || null,
      next: $('.naveps .nvs:last-child a').attr('href') || null,
    };
    const info = {};
    $('.single-info .infox .spe span').each((_, el) => {
      const text = $(el).text().trim();
      const parts = text.split(':');
      if (parts.length > 1) {
        const key = parts[0].trim().toLowerCase();
        const value = parts.slice(1).join(':').trim();
        if (key && value) info[key] = value;
      }
    });
    const otherEpisodes = [];
    $('.listupd .stylefiv').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.bsx .thumb a').attr('href');
      const title = $el.find('.bsx .inf h2 a').text().trim();
      const episodeNum = link?.match(/episode-(\d+)/)?.[1] || null;
      if (link && title && !link.includes(slugOrUrl)) {
        otherEpisodes.push({
          episode: episodeNum || '0',
          title,
          url: link.startsWith('http') ? link : this.base + link,
          releaseDate: null,
        });
      }
    });
    return buildResponse('episode', url, {
      title,
      poster,
      synopsis,
      genres,
      info,
      streams,
      nav,
      otherEpisodes: otherEpisodes.sort((a, b) => parseInt(a.episode) - parseInt(b.episode)),
    });
  }

  async watch(slugOrUrl: string) {
    const result = await this.episode(slugOrUrl);
    result.data = {
      title: result.data.title,
      streams: result.data.streams,
      nav: result.data.nav,
      otherEpisodes: result.data.otherEpisodes,
    };
    return clean(result);
  }

  async genre(slug: string, page = 1) {
    const url = page === 1 ? this.base + `/genres/${slug}/` : this.base + `/genres/${slug}/page/${page}/`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('genre', url, { slug, pagination, items });
  }

  async order(order: string, page = 1) {
    const url = page === 1 ? this.base + `/anime/?order=${order}` : this.base + `/anime/?page=${page}&order=${order}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('order', url, { order, pagination, items });
  }

  async status(status: string, page = 1) {
    const url = page === 1 ? this.base + `/anime/?status=${status}` : this.base + `/anime/?page=${page}&status=${status}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('status', url, { status, pagination, items });
  }

  async type(type: string, page = 1) {
    const url = page === 1 ? this.base + `/anime/?type=${type}` : this.base + `/anime/?page=${page}&type=${type}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('type', url, { type, pagination, items });
  }

  async sub(sub: string, page = 1) {
    const url = page === 1 ? this.base + `/anime/?sub=${sub}` : this.base + `/anime/?page=${page}&sub=${sub}`;
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const items = [];
    $('.listupd .bs').each((_, el) => {
      const card = parseCardHome($, el);
      if (card) items.push(card);
    });
    const pagination = parsePagination($);
    return buildResponse('sub', url, { sub, pagination, items });
  }
}
