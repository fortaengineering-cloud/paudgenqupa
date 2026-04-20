import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

export default function AboutSection() {
  const [aboutContent, setAboutContent] = useState({
    title: "Tentang PAUD GenQuPa",
    content: "",
  });

  useEffect(() => {
    supabase
      .from("site_content")
      .select("title, content")
      .eq("key", "about")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAboutContent({ title: data.title || "Tentang PAUD GenQuPa", content: data.content });
        }
      });
  }, []);

  return (
    <section id="tentang" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Icon / Visual */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-accent flex items-center justify-center">
                <GraduationCap className="h-32 w-32 text-primary opacity-20" />
              </div>
              <div className="absolute inset-8 rounded-full gradient-islamic flex items-center justify-center shadow-xl">
                <div className="text-center p-6">
                  <p className="text-primary-foreground font-bold text-3xl">0-6</p>
                  <p className="text-primary-foreground/80 text-sm mt-1">Tahun</p>
                  <p className="text-primary-foreground font-semibold text-lg mt-2">Golden Age</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Latar Belakang</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              {aboutContent.title}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {aboutContent.content.split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-accent">
                <p className="text-2xl font-bold text-primary">Hybrid</p>
                <p className="text-sm text-muted-foreground">Education Model</p>
              </div>
              <div className="p-4 rounded-xl bg-gold-light">
                <p className="text-2xl font-bold text-secondary">Qur'ani</p>
                <p className="text-sm text-muted-foreground">+ Teknologi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
