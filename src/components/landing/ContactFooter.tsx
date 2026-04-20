import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactFooter() {
  return (
    <>
      <section id="kontak" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Hubungi Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Kontak & Lokasi</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Alamat</h3>
                  <p className="text-muted-foreground">Perumahan Mutiara NIMS Blok B6, Pandeglang, Banten</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Telepon / WhatsApp</h3>
                  <p className="text-muted-foreground">Hubungi kami untuk informasi lebih lanjut</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-muted-foreground">info@paud.genqupa.co.id</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Jam Operasional</h3>
                  <p className="text-muted-foreground">Senin - Jumat: 07:30 - 12:00 WIB</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-xl overflow-hidden shadow-lg bg-muted min-h-[300px] flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Peta Lokasi</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Perumahan Mutiara NIMS Blok B6, Pandeglang
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-islamic py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">G</span>
                </div>
                <div>
                  <span className="font-bold text-primary-foreground">PAUD GenQuPa</span>
                </div>
              </div>
              <p className="text-primary-foreground/70 text-sm">
                Generasi Qur'ani Pandeglang — Mencetak generasi cinta Al-Qur'an,
                berakhlak mulia, dan siap menghadapi tantangan zaman.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary-foreground mb-4">Tautan</h4>
              <ul className="space-y-2">
                {["Beranda", "Tentang", "Program", "Galeri", "Kontak"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary-foreground mb-4">Yayasan</h4>
              <p className="text-primary-foreground/70 text-sm">
                Yayasan Pendidikan Generasi Qurani Pandeglang
              </p>
              <p className="text-primary-foreground/70 text-sm mt-2">
                Perumahan Mutiara NIMS Blok B6
                <br />
                Pandeglang, Banten
              </p>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} PAUD GenQuPa. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
