import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Pause, Play, ExternalLink } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
}

const DEFAULT_INTERVAL = 5000;

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [interval, setIntervalMs] = useState<number>(() => {
    const stored = Number(localStorage.getItem("bannerIntervalMs"));
    return stored && stored >= 1000 ? stored : DEFAULT_INTERVAL;
  });

  useEffect(() => {
    supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setBanners(data as Banner[]);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(id);
  }, [banners.length, isPaused, interval]);

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];
  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };
  const togglePause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPaused((p) => !p);
  };

  const content = (
    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[4/3] w-full md:max-w-md lg:max-w-xl mx-auto group bg-muted">
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-full h-full object-cover"
      />
      
      {/* Caption at the bottom - bright and clear */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 border-t border-primary/10 transition-transform duration-300">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-primary font-bold text-sm md:text-base leading-tight">
              {banner.title}
            </h3>
            {banner.description && (
              <p className="text-muted-foreground text-[10px] md:text-xs mt-1 line-clamp-2">
                {banner.description}
              </p>
            )}
          </div>
          {banner.link_url && (
            <div className="bg-primary/10 rounded-full p-1.5 shrink-0 group-hover:bg-primary/20 transition-colors">
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={goPrev}
            aria-label="Banner sebelumnya"
            className="absolute left-2 top-[40%] -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Banner berikutnya"
            className="absolute right-2 top-[40%] -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Pause/Play */}
          <button
            onClick={togglePause}
            aria-label={isPaused ? "Putar slide" : "Jeda slide"}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-primary rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md"
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          {/* Indicators for current slide position */}
          <div className="absolute top-2 left-4 flex gap-1">
            {banners.map((_, i) => (
              <div 
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-primary" : "w-2 bg-primary/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
