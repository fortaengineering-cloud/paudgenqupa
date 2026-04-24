import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Info, MessageSquare, Landmark, Upload, Loader2, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/logger";

const DEFAULT_SETTINGS = {
  bank_info: "BSI - 7148785443 a.n Ayi Jabaruti",
  wa_template_tagihan: "Assalamu'alaikum Ayah/Bunda [NAMA_AYAH] / [NAMA_IBU], ✨\n\nAlhamdulillah, pendaftaran online ananda [NAMA_ANAK] telah berhasil masuk ke sistem PPDB PAUD Tunas GenQuPa. 🏫\n\nUntuk melanjutkan proses pendaftaran ke tahap berikutnya, mohon berkenan menyelesaikan biaya pendaftaran sebesar Rp 200.000,-. Pembayaran dapat dilakukan secara tunai (cash) atau melalui transfer ke rekening berikut:\n\n💳 [BANK_INFO]\n\nBagi Ayah/Bunda yang melakukan pembayaran via transfer, mohon untuk segera mengonfirmasi dengan mengunggah bukti transfer di aplikasi, atau membalas pesan WA ini agar data dapat segera kami verifikasi. 🧾✅\n\nPengumuman selanjutnya terkait alur PPDB akan kami infokan melalui pesan WA dan juga dapat dipantau langsung di aplikasi. 📱\n\nTerima kasih atas kepercayaannya memilih PAUD Tunas GenQuPa. Semoga Allah Ta'ala meridhai dan senantiasa memberikan kemudahan bagi kita semua. 🤲\n\nJazaakumullaahu khayran wa baarakallahu fiikum.\nPanitia PPDB PAUD Tunas GenQuPa 🌿",
  wa_template_penerimaan: "Assalamu'alaikum Ayah/Bunda [NAMA_ORTU], ✨\n\nAlhamdulillah, ananda [NAMA_ANAK] dinyatakan LULUS dalam seleksi penerimaan siswa baru PAUD GenQuPa. 🏫🎊\n\nSilakan datang ke sekolah untuk proses daftar ulang. Selamat! 📱🤩",
};

export default function AppSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDesc, setBannerDesc] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings' as any)
        .select('*')
        .maybeSingle();
        
      if (error) throw error;
      if (data) {
        setSettings(data as any);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error.message);
    }
  };

  const handleSave = async () => {
    try {
      // Check if row exists
      const { data: existing } = await supabase
        .from('app_settings' as any)
        .select('id')
        .maybeSingle();

      const payload = {
        bank_info: settings.bank_info,
        wa_template_tagihan: settings.wa_template_tagihan,
        wa_template_penerimaan: settings.wa_template_penerimaan,
      };

      let error;
      if (existing) {
        const result = await supabase
          .from('app_settings' as any)
          .update(payload)
          .eq('id', (existing as any).id);
        error = result.error;
      } else {
        const result = await supabase
          .from('app_settings' as any)
          .insert([payload]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Pengaturan Tersimpan",
        description: "Data pengaturan WhatsApp dan Pembayaran telah diperbarui di database.",
      });
      logActivity("Pengaturan", "Memperbarui pengaturan sistem di database");
    } catch (error: any) {
      toast({
        title: "Gagal Menyimpan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!bannerTitle.trim()) {
      toast({ title: "Judul Wajib", description: "Mohon isi judul banner terlebih dahulu.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("banners").insert({
        title: bannerTitle.trim(),
        description: bannerDesc.trim(),
        link_url: bannerLink.trim() || null,
        image_url: publicUrl,
        is_active: true,
        sort_order: 0,
      });

      if (insertError) throw insertError;

      toast({ title: "Berhasil", description: "Banner baru telah ditambahkan ke carousel." });
      setBannerTitle("");
      setBannerDesc("");
      setBannerLink("");
      logActivity("Pengaturan", `Menambah banner carousel: ${bannerTitle}`);
    } catch (error: any) {
      toast({ title: "Gagal Upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Pengaturan Sistem</h2>
        <p className="text-sm text-muted-foreground">Konfigurasi WhatsApp template, informasi pembayaran, dan banner</p>
      </div>

      <div className="grid gap-6">
        {/* Banner Carousel Section */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Upload Banner Carousel
            </CardTitle>
            <CardDescription>Tambahkan banner promo atau pengumuman baru untuk dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner_title">Judul Banner</Label>
                <Input
                  id="banner_title"
                  placeholder="Contoh: Promo Ramadhan"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner_link">Link URL (Opsional)</Label>
                <Input
                  id="banner_link"
                  placeholder="https://..."
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_desc">Deskripsi Singkat</Label>
              <Textarea
                id="banner_desc"
                placeholder="Tuliskan detail promo atau pengumuman di sini..."
                rows={2}
                value={bannerDesc}
                onChange={(e) => setBannerDesc(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <Label htmlFor="banner-upload" className="cursor-pointer group">
                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Mengunggah banner...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                      <p className="text-sm font-medium text-foreground">Pilih Gambar Banner</p>
                      <p className="text-xs text-muted-foreground mt-1">Rekomendasi: 1200x400px (Max 2MB)</p>
                    </>
                  )}
                </div>
              </Label>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </CardContent>
        </Card>

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
