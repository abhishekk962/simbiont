import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = "https://api.unsplash.com";
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// In-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(endpoint: string, params: Record<string, string>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `${endpoint}?${sortedParams}`;
}

function getCachedData(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Clean up expired cache entries periodically
function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION_MS) {
      cache.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredCache, 10 * 60 * 1000);

export async function GET(request: NextRequest) {
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Unsplash API key not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";
  const orderBy = searchParams.get("order_by") || "latest";

  let endpoint: string;
  let params: Record<string, string>;

  if (query) {
    // Search for photos
    endpoint = "/search/photos";
    params = {
      query,
      page,
      per_page: perPage,
    };
  } else {
    // Get new/latest photos
    endpoint = "/photos";
    params = {
      page,
      per_page: perPage,
      order_by: orderBy,
    };
  }

  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return NextResponse.json({
      ...cachedData,
      cached: true,
      cacheAge: Math.floor(
        (Date.now() - (cache.get(cacheKey)?.timestamp || 0)) / 1000
      ),
    });
  }

  try {
    const url = new URL(`${UNSPLASH_API_BASE}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch from Unsplash", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize response format (search returns { results: [...] }, photos returns [...])
    const normalizedData = {
      photos: query ? data.results : data,
      total: query ? data.total : undefined,
      totalPages: query ? data.total_pages : undefined,
      page: parseInt(page),
      perPage: parseInt(perPage),
      query: query || null,
    };

    // Cache the response
    setCachedData(cacheKey, normalizedData);

    return NextResponse.json({
      ...normalizedData,
      cached: false,
    });
  } catch (error) {
    console.error("Unsplash API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images from Unsplash" },
      { status: 500 }
    );
  }
}
