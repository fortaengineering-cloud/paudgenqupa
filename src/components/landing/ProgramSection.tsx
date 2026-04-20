import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Heart, Gamepad2, Languages } from "lucide-react";

const programs = [
  {
    icon: BookOpen,
    title: "Tahfidz Juz 30",
    description: "Program hafalan Al-Qur'an Juz 30 dengan metode yang menyenangkan dan mudah dipahami anak usia dini.",
    color: "gradient-islamic",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Heart,
    title: "Adab Islami",
    description: "Pembentukan karakter dan akhlak mulia melalui pembiasaan adab-adab Islami dalam kehidupan sehari-hari.",
    color: "bg-secondary",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    icon: Gamepad2,
    title: "Play-Based Learning",
    description: "Metode belajar melalui bermain yang menstimulasi perkembangan kognitif, motorik, dan sosial-emosional anak.",
    color: "gradient-islamic",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Languages,
    title: "Multilingual",
    description: "Pengenalan tiga bahasa: Indonesia, Arab, dan Inggris untuk mempersiapkan anak berdaya saing global.",
    color: "bg-secondary",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
];

export default function ProgramSection() {
  return (
    <section id="program" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Kurikulum</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Program Unggulan</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Kami mengintegrasikan pendidikan Qur'ani dengan pendekatan pembelajaran modern
            untuk perkembangan optimal anak usia dini.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program) => (
            <Card key={program.title} className="border-0 shadow-md hover:shadow-xl transition-shadow group">
              <CardHeader className="pb-2">
                <div className={`w-14 h-14 rounded-xl ${program.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <program.icon className={`h-7 w-7 ${program.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{program.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
