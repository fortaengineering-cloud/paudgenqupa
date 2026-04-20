import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Plus, GripVertical, ExternalLink } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setBanners(data as Banner[]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newTitle.trim()) {
      toast({ title: "Error", description: "Judul banner harus diisi.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Gagal upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(fileName);

    const { error } = await supabase.from("banners").insert({
      title: newTitle.trim(),
      image_url: publicUrl,
      link_url: newLink.trim() || null,
      sort_order: banners.length,
    });

    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      setNewTitle("");
      setNewLink("");
      fetchBanners();
      toast({ title: "Berhasil!", description: "Banner ditambahkan." });
    }
    setUploading(false);
    e.target.value = "";
  };

  const toggleActive = async (banner: Banner) => {
    await supabase.from("banners").update({ is_active: !banner.is_active }).eq("id", banner.id);
    fetchBanners();
  };

  const deleteBanner = async (banner: Banner) => {
    const fileName = banner.image_url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("banners").remove([fileName]);
    }
    await supabase.from("banners").delete().eq("id", banner.id);
    fetchBanners();
    toast({ title: "Berhasil!", description: "Banner dihapus." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Manajemen Banner</h2>
        <p className="text-sm text-muted-foreground">Kelola banner pengumuman untuk dashboard orang tua</p>
      </div>

      {/* Add Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Banner Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Judul Banner *</Label>
              <Input
                placeholder="Judul banner"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Link (opsional)</Label>
              <Input
                placeholder="https://..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="banner-upload" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload gambar banner</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Rekomendasi: 1200×400px</p>
                  </>
                )}
              </div>
            </Label>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Banner List */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full sm:w-48 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">{banner.title}</h3>
                  {banner.link_url && (
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {banner.link_url}
                    </a>
                  )}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => toggleActive(banner)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {banner.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteBanner(banner)}>
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada banner. Tambahkan banner pertama di atas.
          </div>
        )}
      </div>
    </div>
  );
}
