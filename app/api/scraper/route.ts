import { NextRequest, NextResponse } from 'next/server';
import SamehadakuScraper from '@/lib/scrapers/anime/samehadaku';
import DonghuaScraper from '@/lib/scrapers/donghua/donghub';
import Filem21Scraper from '@/lib/scrapers/movie/filem21';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const RAILWAY_PROXY = 'https://aethra-backend.up.railway.app/api';
const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const source = searchParams.get('source');
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const query = searchParams.get('query') || '';
  const slug = searchParams.get('slug') || '';
  const genre = searchParams.get('genre') || '';
  const country = searchParams.get('country') || '';
  const status = searchParams.get('status') || '';
  const order = searchParams.get('order') || '';
  const typeParam = searchParams.get('typeParam') || '';
  const sub = searchParams.get('sub') || '';

  if (!source) {
    return NextResponse.json({ error: 'Parameter "source" wajib diisi', code: 'MISSING_SOURCE' }, { status: 400 });
  }

  const validSources = ['anime', 'donghua', 'movie', 'komik'];
  if (!validSources.includes(source)) {
    return NextResponse.json({ error: `Source "${source}" tidak valid`, code: 'INVALID_SOURCE' }, { status: 400 });
  }

  const cacheKey = `${source}-${type}-${page}-${query}-${slug}-${genre}-${country}-${status}-${order}-${typeParam}-${sub}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    let result;

    if (source === 'anime') {
      const scraper = new SamehadakuScraper();
      switch (type) {
        case 'home': result = await scraper.home(page); break;
        case 'terbaru': result = await scraper.terbaru(page); break;
        case 'ongoing': result = await scraper.ongoing(page); break;
        case 'completed': result = await scraper.completed(page); break;
        case 'batch': result = await scraper.batch(page); break;
        case 'schedule': result = await scraper.schedule(); break;
        case 'movie': result = await scraper.movie(page); break;
        case 'search':
          if (!query) throw new Error('Query required');
          result = await scraper.search(query, page);
          break;
        case 'detail':
          if (!slug) throw new Error('Slug required');
          result = await scraper.detail(slug);
          break;
        case 'episode':
          if (!slug) throw new Error('Slug required');
          result = await scraper.episode(slug);
          break;
        case 'catalog':
          result = await scraper.catalog(page, { status, type: typeParam, order, genre: genre ? [genre] : [] });
          break;
        case 'genre':
          if (!slug) throw new Error('Genre slug required');
          result = await scraper.genre(slug, page);
          break;
        default: throw new Error('Invalid type for anime');
      }
    } else if (source === 'donghua') {
      const scraper = new DonghuaScraper();
      switch (type) {
        case 'home': result = await scraper.home(page); break;
        case 'ongoing': result = await scraper.ongoing(page); break;
        case 'completed': result = await scraper.completed(page); break;
        case 'schedule': result = await scraper.schedule(); break;
        case 'search':
          if (!query) throw new Error('Query required');
          result = await scraper.search(query, page);
          break;
        case 'detail':
          if (!slug) throw new Error('Slug required');
          result = await scraper.detail(slug);
          break;
        case 'episode':
          if (!slug) throw new Error('Slug required');
          result = await scraper.episode(slug);
          break;
        case 'genre':
          if (!slug) throw new Error('Genre slug required');
          result = await scraper.genre(slug, page);
          break;
        case 'order':
          if (!order) throw new Error('Order required');
          result = await scraper.order(order, page);
          break;
        case 'status':
          if (!status) throw new Error('Status required');
          result = await scraper.status(status, page);
          break;
        case 'type':
          if (!typeParam) throw new Error('Type required');
          result = await scraper.type(typeParam, page);
          break;
        case 'sub':
          if (!sub) throw new Error('Sub required');
          result = await scraper.sub(sub, page);
          break;
        default: throw new Error('Invalid type for donghua');
      }
    } else if (source === 'movie') {
      const scraper = new Filem21Scraper();
      switch (type) {
        case 'home': result = await scraper.home(page); break;
        case 'search':
          if (!query) throw new Error('Query required');
          result = await scraper.search(query, page);
          break;
        case 'genre':
          if (!slug) throw new Error('Genre slug required');
          result = await scraper.genre(slug, page);
          break;
        case 'country':
          if (!slug) throw new Error('Country slug required');
          result = await scraper.country(slug, page);
          break;
        case 'detail':
          if (!slug) throw new Error('Slug required');
          result = await scraper.detail(slug);
          break;
        default: throw new Error('Invalid type for movie');
      }
    } else if (source === 'komik') {
      const proxyUrl = new URL(RAILWAY_PROXY);
      proxyUrl.searchParams.set('source', source);
      proxyUrl.searchParams.set('type', type);
      proxyUrl.searchParams.set('page', String(page));
      if (query) proxyUrl.searchParams.set('query', query);
      if (slug) proxyUrl.searchParams.set('slug', slug);
      if (genre) proxyUrl.searchParams.set('genre', genre);
      if (country) proxyUrl.searchParams.set('country', country);
      if (status) proxyUrl.searchParams.set('status', status);
      if (order) proxyUrl.searchParams.set('order', order);
      if (typeParam) proxyUrl.searchParams.set('typeParam', typeParam);
      if (sub) proxyUrl.searchParams.set('sub', sub);

      const response = await fetch(proxyUrl.toString(), {
        headers: { 'User-Agent': 'AETHRA-Vercel/1.0' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxy error: ${response.status} - ${errorText}`);
      }
      result = await response.json();
    } else {
      throw new Error('Invalid source');
    }

    cache.set(cacheKey, { data: result, time: Date.now() });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900',
        'X-Cache': 'MISS',
      },
    });

  } catch (error) {
    console.error('API Error:', error.message);
    let status = 500;
    let code = 'INTERNAL_ERROR';

    if (error.message.includes('Query required')) { status = 400; code = 'MISSING_QUERY'; }
    else if (error.message.includes('Slug required')) { status = 400; code = 'MISSING_SLUG'; }
    else if (error.message.includes('Invalid type')) { status = 400; code = 'INVALID_TYPE'; }
    else if (error.message.includes('400')) { status = 400; code = 'PROXY_BAD_REQUEST'; }
    else if (error.message.includes('404')) { status = 404; code = 'PROXY_NOT_FOUND'; }
    else if (error.message.includes('timeout') || error.message.includes('timed out')) { status = 504; code = 'PROXY_TIMEOUT'; }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error', code, source, type, timestamp: new Date().toISOString() },
      { status }
    );
  }
}
