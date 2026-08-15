import { NextResponse } from 'next/server';
import SamehadakuScraper from '@/lib/scrapers/anime/samehadaku';
import DonghuaScraper from '@/lib/scrapers/donghua/donghub';
import Filem21Scraper from '@/lib/scrapers/movie/filem21';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const RAILWAY_PROXY = 'https://aethra-backend.up.railway.app/api';
const cache = new Map();
const CACHE_TTL = 30 * 1000;

export async function GET() {
  const cacheKey = 'stats';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  }

  try {
    let animeStats = { status: 'offline', total: 0 };
    let donghuaStats = { status: 'offline', total: 0 };
    let movieStats = { status: 'offline', total: 0 };

    try {
      const scraper = new SamehadakuScraper();
      const data = await scraper.home(1);
      const items = data?.data?.items || [];
      animeStats = { status: 'online', total: items.length };
    } catch (e) {}

    try {
      const scraper = new DonghuaScraper();
      const data = await scraper.home(1);
      const items = data?.data?.latest || [];
      donghuaStats = { status: 'online', total: items.length };
    } catch (e) {}

    try {
      const scraper = new Filem21Scraper();
      const data = await scraper.home(1);
      const items = data?.items || [];
      movieStats = { status: 'online', total: items.length };
    } catch (e) {}

    const response = await fetch(`${RAILWAY_PROXY}/stats`, {
      headers: { 'User-Agent': 'AETHRA-Vercel/1.0' },
    });

    let railwayStats = { komik: { status: 'offline', total: 0 } };
    if (response.ok) {
      railwayStats = await response.json();
    }

    const stats = {
      anime: animeStats,
      donghua: donghuaStats,
      komik: railwayStats.komik || { status: 'offline', total: 0 },
      movie: movieStats,
      total: 0,
      updatedAt: new Date().toISOString(),
    };

    stats.total = (stats.anime?.total || 0) + (stats.donghua?.total || 0) + (stats.komik?.total || 0) + (stats.movie?.total || 0);

    cache.set(cacheKey, { data: stats, time: Date.now() });

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        anime: { status: 'offline', total: 0 },
        donghua: { status: 'offline', total: 0 },
        komik: { status: 'offline', total: 0 },
        movie: { status: 'offline', total: 0 },
        total: 0,
        updatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
