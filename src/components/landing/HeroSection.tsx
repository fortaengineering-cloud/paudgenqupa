import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, LayoutDashboard, LogIn, ChevronLeft, ChevronRight, ExternalLink, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url: string | null;
}

export default function HeroSection() {
  const { user, isAdminUser } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const waMessage = "Assalamu'alaikum, \n\nPerkenalkan saya:\nNama:\nDomisili:\n\nSaya ingin bertanya lebih lanjut mengenai pendaftaran di PAUD GenQuPa. Jazaakumullaahu khayran.";
  const waLink = `https://wa.me/6281214177741?text=${encodeURIComponent(waMessage)}`;

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        setBanners(data as Banner[]);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <section id="beranda" className="relative min-h-[90vh] flex items-center islamic-pattern overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-gold-light opacity-80" />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <Star className="h-4 w-4 text-secondary" />
              Pendaftaran Tahun Ajaran Baru Dibuka!
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-foreground">Generasi</span>{" "}
              <span className="text-primary">Qur'ani</span>{" "}
              <span className="text-secondary">Pandeglang</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-lg">
              Mencetak generasi cinta Al-Qur'an, berakhlak mulia, dan siap menghadapi tantangan zaman melalui 
              pendidikan usia dini yang inovatif.
            </p>

            <p className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0" />
              Yayasan Pendidikan Generasi Qurani Pandeglang
            </p>

            <div className="grid grid-cols-1 sm:flex sm:flex-row flex-wrap gap-3 sm:gap-4 w-full">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-islamic border-0 text-base px-8 shadow-lg hover:shadow-xl transition-shadow w-full">
                  Daftar Sekarang
                </Button>
              </Link>

              <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 font-semibold text-base px-8 shadow-lg transition-all w-full flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Tanya Info (WA)
                </Button>
              </a>
              
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                {user ? (
                  <Link to={isAdminUser ? "/admin" : "/dashboard"} className="w-full">
                    <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 font-semibold text-base px-8 shadow-lg hover:shadow-xl transition-shadow w-full">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" className="w-full">
                    <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 font-semibold text-base px-8 shadow-lg hover:shadow-xl transition-shadow w-full">
                      <LogIn className="h-5 w-5 mr-2" />
                      Masuk
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
          </div>

          {/* QLMS v1 Style Banner Slider */}
          <div className="animate-fade-in relative mt-8 lg:mt-0" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-muted border-4 border-white/50">
              {banners.length > 0 ? (
                <>
                  <div className="relative w-full h-full">
                    {banners.map((banner, index) => (
                      <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                          index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                      >
                        {banner.link_url ? (
                          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Caption Box */}
                            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-sm bg-white/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/20 shadow-xl transform transition-all duration-300">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-foreground text-sm md:text-xl line-clamp-1">{banner.title}</h3>
                                    <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" />
                                </div>
                                {banner.description && (
                                    <p className="text-muted-foreground text-[10px] md:text-sm line-clamp-2 leading-relaxed">
                                        {banner.description}
                                    </p>
                                )}
                            </div>
                          </a>
                        ) : (
                          <div className="w-full h-full relative">
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Caption Box */}
                            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-sm bg-white/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/20 shadow-xl">
                                <h3 className="font-bold text-foreground text-sm md:text-xl mb-1 line-clamp-1">{banner.title}</h3>
                                {banner.description && (
                                    <p className="text-muted-foreground text-[10px] md:text-sm line-clamp-2 leading-relaxed">
                                        {banner.description}
                                    </p>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation Controls */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm text-foreground hover:bg-white hover:scale-110 transition-all shadow-md"
                        aria-label="Slide sebelumnya"
                      >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm text-foreground hover:bg-white hover:scale-110 transition-all shadow-md"
                        aria-label="Slide berikutnya"
                      >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                      
                      {/* Dot Indicators */}
                      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
                        {banners.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === currentIndex ? "w-6 md:w-8 bg-primary" : "w-1.5 md:w-2 bg-primary/40"
                            }`}
                            aria-label={`Ke slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Empty state / Loading state */
                <div className="w-full h-full flex flex-col items-center justify-center bg-accent/20 p-8 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
                  </div>
                  <p className="text-primary font-bold text-lg md:text-xl">PAUD GenQuPa</p>
                  <p className="text-muted-foreground text-xs md:text-sm mt-2">Mencetak Generasi Qur'ani</p>
                </div>
              )}
              
              {/* Decorative side accent */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-secondary/30 blur-2xl z-0" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary/20 blur-2xl z-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}