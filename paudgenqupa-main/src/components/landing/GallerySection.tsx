import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Photo {
  id: string;
  category_id: string;
  image_url: string;
  caption: string | null;
}

export default function GallerySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    supabase.from("gallery_categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
    });
    supabase.from("gallery_photos").select("*").then(({ data }) => {
      if (data) setPhotos(data);
    });
  }, []);

  const filteredPhotos = activeCategory === "all"
    ? photos
    : photos.filter((p) => p.category_id === activeCategory);

  return (
    <section id="galeri" className="py-20 bg-accent/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Dokumentasi</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Galeri Kegiatan</h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className={activeCategory === "all" ? "gradient-islamic border-0" : ""}
          >
            Semua
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? "gradient-islamic border-0" : ""}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Foto kegiatan"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-3">
                    <p className="text-background text-sm font-medium">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Camera className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada foto yang ditambahkan.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Foto kegiatan akan ditampilkan di sini setelah dikelola oleh admin.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
