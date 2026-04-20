import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center islamic-pattern">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-gold-light opacity-80" />

      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
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
              <BookOpen className="h-4 w-4" />
              Yayasan Pendidikan Generasi Qurani Pandeglang
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="gradient-islamic border-0 text-base px-8 shadow-lg hover:shadow-xl transition-shadow">
                  Daftar Sekarang
                </Button>
              </Link>
              <a href="#tentang">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Pelajari Lebih Lanjut
                </Button>
              </a>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="animate-fade-in hidden lg:block" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-2xl gradient-islamic flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <p className="text-primary-foreground text-xl font-bold">PAUD GenQuPa</p>
                  <p className="text-primary-foreground/80 text-sm mt-2">Hybrid Education: Quran + Teknologi</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-secondary/30 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary/20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
