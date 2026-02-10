export interface UnsplashPhoto {
  id: string;
  slug: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    portfolio_url: string | null;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      html: string;
    };
  };
  created_at: string;
  updated_at: string;
  likes: number;
}

export interface UnsplashResponse {
  photos: UnsplashPhoto[];
  total?: number;
  totalPages?: number;
  page: number;
  perPage: number;
  query: string | null;
  cached: boolean;
  cacheAge?: number;
}

export async function fetchUnsplashPhotos(
  options: {
    query?: string;
    page?: number;
    perPage?: number;
    orderBy?: "latest" | "oldest" | "popular";
  } = {}
): Promise<UnsplashResponse> {
  const { query, page = 1, perPage = 20, orderBy = "latest" } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    order_by: orderBy,
  });

  if (query) {
    params.set("query", query);
  }

  const response = await fetch(`/api/unsplash?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch images from Unsplash");
  }

  return response.json();
}
