"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchUnsplashPhotos,
  type UnsplashPhoto,
  type UnsplashResponse,
} from "@/lib/unsplash";
import {
  Search,
  Loader2,
  ImageIcon,
  Download,
  ExternalLink,
  RefreshCw,
  Clock,
} from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { useReactFlow } from "@xyflow/react";
import { set } from "zod";

interface MediaLibraryProps {
  onSelectImage?: (photo: UnsplashPhoto) => void;
}

export default function MediaLibrary({ onSelectImage }: MediaLibraryProps) {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    cached: boolean;
    cacheAge?: number;
  } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(
    null
  );

  const { setNodes, getNode, setEdges, getNodesBounds, updateNodeData, screenToFlowPosition } =
    useReactFlow();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
      setPhotos([]);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch photos
  const fetchPhotos = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const response: UnsplashResponse = await fetchUnsplashPhotos({
          query: debouncedQuery || undefined,
          page: pageNum,
          perPage: 20,
          orderBy: "latest",
        });

        setCacheInfo({
          cached: response.cached,
          cacheAge: response.cacheAge,
        });

        if (append) {
          setPhotos((prev) => [...prev, ...response.photos]);
        } else {
          setPhotos(response.photos);
        }

        // Check if there are more pages
        if (response.totalPages !== undefined) {
          setHasMore(pageNum < response.totalPages);
        } else {
          setHasMore(response.photos.length === 20);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch images");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedQuery]
  );

  // Initial fetch and when search query changes
  useEffect(() => {
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  // Load more photos
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhotos(nextPage, true);
    }
  };

  // Refresh photos
  const refresh = () => {
    setPage(1);
    setPhotos([]);
    fetchPhotos(1, false);
  };

  // Handle photo selection
  const handlePhotoClick = (photo: UnsplashPhoto, event: React.MouseEvent<HTMLDivElement>) => {
    setSelectedPhoto(photo);
    onSelectImage?.(photo);
    const x = event.clientX;
    const y = event.clientY;
    const position = screenToFlowPosition({ x, y });
    setNodes((nodes) => [
      ...nodes,
      {
        id: `image-${photo.id}`,
        type: "image",
        position,
        data: { url: photo.urls.thumb, alt: photo.alt_description || "" },
      },
    ]);
  };

  // Format cache age
  const formatCacheAge = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <DialogContent className="max-w-4xl h-[70vh] flex flex-col left-86">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Media Library
        </DialogTitle>
      </DialogHeader>

      {/* Search and Controls */}
      <div className="flex items-center gap-2 py-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Search for images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Cache Info */}
      {cacheInfo && cacheInfo.cached ? (
        <div className="text-xs text-muted-foreground px-1">
          Cached response{" "}
          {cacheInfo.cacheAge !== undefined &&
            `(${formatCacheAge(cacheInfo.cacheAge)})`}
        </div>
      ) : (
        <div>Fresh data from Unsplash</div>
      )}

      {/* Content */}
      <>
        {loading && photos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={refresh}>
              Try Again
            </Button>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">No images found</p>
            {debouncedQuery && (
              <p className="text-sm text-muted-foreground">
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4 overflow-y-auto">
            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedPhoto?.id === photo.id
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={(event) => handlePhotoClick(photo, event)}
                >
                  <img
                    src={photo.urls.small}
                    alt={photo.alt_description || "Unsplash image"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            )}
          </div>
        )}
      </>
    </DialogContent>
  );
}
