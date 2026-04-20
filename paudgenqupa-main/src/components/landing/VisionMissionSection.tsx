import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Target } from "lucide-react";

export default function VisionMissionSection() {
  const [vision, setVision] = useState({ title: "Visi", content: "" });
  const [mission, setMission] = useState({ title: "Misi", content: "" });

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, title, content")
      .in("key", ["vision", "mission"])
      .then(({ data }) => {
        data?.forEach((item) => {
          if (item.key === "vision") setVision({ title: item.title || "Visi", content: item.content });
          if (item.key === "mission") setMission({ title: item.title || "Misi", content: item.content });
        });
      });
  }, []);

  const missionItems = mission.content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());

  return (
    <section id="visi-misi" className="py-20 bg-accent/50 islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Arah & Tujuan</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Visi & Misi</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Vision Card */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="gradient-islamic p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground">{vision.title}</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed text-lg">{vision.content}</p>
            </CardContent>
          </Card>

          {/* Mission Card */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="gradient-gold p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-foreground">{mission.title}</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <ol className="space-y-3">
                {missionItems.map((item, i) => (
                  <li key={i} className="flex gap-3 text-muted-foreground">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-islamic flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
