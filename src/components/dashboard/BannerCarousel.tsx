import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];

  const content = (
    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[3/1] min-h-[120px]">
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <p className="text-background font-semibold text-sm md:text-base">{banner.title}</p>
        {banner.link_url && (
          <ExternalLink className="h-4 w-4 text-background flex-shrink-0" />
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 right-4 flex gap-1">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-background" : "bg-background/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
