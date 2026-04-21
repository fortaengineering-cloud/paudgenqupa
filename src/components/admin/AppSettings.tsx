import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Info, MessageSquare, Landmark } from "lucide-react";

const DEFAULT_SETTINGS = {
  bank_info: "BSI - 7149021832 a.n Yayasan Generasi Qurani Pandeglang",
  wa_template_tagihan: "Assalamu'alaikum Ayah/Bunda [NAMA_ORTU], ✨\n\nAlhamdulillah, pendaftaran online ananda [NAMA_ANAK] telah berhasil masuk ke sistem PPDB PAUD Tunas GenQuPa. 🏫\n\nInformasi pembayaran biaya pendaftaran pendaftaran:\n💳 [BANK_INFO]\n\nMohon konfirmasi dengan mengunggah bukti transfer di aplikasi. Terima kasih! 🧾✅",
  wa_template_penerimaan: "Assalamu'alaikum Ayah/Bunda [NAMA_ORTU], ✨\n\nAlhamdulillah, ananda [NAMA_ANAK] dinyatakan LULUS dalam seleksi penerimaan siswa baru PAUD GenQuPa. 🏫🎊\n\nSilakan datang ke sekolah untuk proses daftar ulang. Selamat! 📱🤩",
};

export default function AppSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    toast({
      title: "Pengaturan Tersimpan",
      description: "Data pengaturan WhatsApp dan Pembayaran telah diperbarui.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Pengaturan Sistem</h2>
        <p className="text-sm text-muted-foreground">Konfigurasi WhatsApp template dan informasi pembayaran</p>
      </div>

      <div className="grid gap-6">
        {/* Bank Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Informasi Pembayaran
            </CardTitle>
            <CardDescription>Akan muncul di placeholder [BANK_INFO]</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_info">Detail Bank</Label>
              <Input
                id="bank_info"
                placeholder="Contoh: BSI - 123456789 a.n Yayasan"
                value={settings.bank_info}
                onChange={(e) => setSettings({ ...settings, bank_info: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* WA Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Template WhatsApp
            </CardTitle>
            <CardDescription>Gunakan placeholder [NAMA_ORTU], [NAMA_AYAH], [NAMA_IBU], [NAMA_ANAK], dan [BANK_INFO]</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tagihan">Template Tagihan Pendaftaran</Label>
              <Textarea
                id="tagihan"
                rows={4}
                value={settings.wa_template_tagihan}
                onChange={(e) => setSettings({ ...settings, wa_template_tagihan: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="penerimaan">Template Pengumuman Kelulusan</Label>
              <Textarea
                id="penerimaan"
                rows={4}
                value={settings.wa_template_penerimaan}
                onChange={(e) => setSettings({ ...settings, wa_template_penerimaan: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Placeholders Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
          <Info className="h-5 w-5 shrink-0" />
          <p>
            <strong>Tips:</strong> Pastikan Anda tidak menghapus kurung siku pada placeholder. Sistem akan otomatis mengganti teks tersebut dengan data asli pendaftar saat Anda mengklik tombol WhatsApp.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full sm:w-fit py-6 px-10 gap-2 text-lg">
          <Save className="h-5 w-5" />
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
}
