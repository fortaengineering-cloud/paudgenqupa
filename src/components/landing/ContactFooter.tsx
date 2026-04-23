import { MapPin, Mail, Clock, MessageSquare } from "lucide-react";

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
                  <p className="text-muted-foreground leading-relaxed mt-1">
                    Perumahan Mutiara NIMS Blok B6,<br/>
                    Saruni, Kec. Majasari,<br/>
                    Kabupaten Pandeglang, Banten 17531
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <a 
                  href="https://wa.me/6281214177741" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 hover:bg-emerald-50 hover:scale-110 transition-all group"
                  title="Chat via WhatsApp"
                >
                  <MessageSquare className="h-6 w-6 text-primary group-hover:text-emerald-600" />
                </a>
                <div>
                  <h3 className="font-semibold text-foreground">Telepon / WhatsApp</h3>
                  <a href="https://wa.me/6281214177741" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors mt-1 inline-block">
                    +62 812-1417-7741
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <a href="mailto:info@paud.genqupa.co.id" className="text-muted-foreground hover:text-primary transition-colors mt-1 inline-block">
                    info@paud.genqupa.co.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Jam Operasional</h3>
                  <p className="text-muted-foreground mt-1">Senin - Jumat: 07:30 - 12:00 WIB</p>
                </div>
              </div>
            </div>

            {/* Google Maps Iframe dengan Format Resmi HTTPS */}
            <div className="rounded-xl overflow-hidden shadow-lg bg-muted min-h-[300px] md:min-h-[400px] w-full relative">
              <iframe 
                src="https://maps.google.com/maps?q=-6.323072485921823,106.07837428105698&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi PAUD Tunas GenQuPa"
              ></iframe>
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
              <p className="text-primary-foreground/70 text-sm mt-2 leading-relaxed">
                Perumahan Mutiara NIMS Blok B6
                <br />
                Saruni, Majasari
                <br />
                Pandeglang, Banten 17531
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