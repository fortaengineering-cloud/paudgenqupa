import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Plus, FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Photo {
  id: string;
  category_id: string;
  image_url: string;
  caption: string | null;
}

export default function GalleryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newCategory, setNewCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, photoRes] = await Promise.all([
      supabase.from("gallery_categories").select("*").order("name"),
      supabase.from("gallery_photos").select("*").order("created_at", { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (photoRes.data) setPhotos(photoRes.data);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase.from("gallery_categories").insert({ name: newCategory.trim() });
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      setNewCategory("");
      fetchData();
      toast({ title: "Berhasil!", description: "Kategori ditambahkan." });
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("gallery_categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      fetchData();
      toast({ title: "Berhasil!", description: "Kategori dihapus." });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCategory) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Gagal upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(fileName);

    const { error } = await supabase.from("gallery_photos").insert({
      category_id: uploadCategory,
      image_url: publicUrl,
      caption: caption || null,
    });

    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      setCaption("");
      fetchData();
      toast({ title: "Berhasil!", description: "Foto ditambahkan." });
    }
    setUploading(false);
    e.target.value = "";
  };

  const deletePhoto = async (photo: Photo) => {
    const fileName = photo.image_url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("gallery").remove([fileName]);
    }
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    fetchData();
    toast({ title: "Berhasil!", description: "Foto dihapus." });
  };

  const filteredPhotos = selectedCategory === "all"
    ? photos
    : photos.filter((p) => p.category_id === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Manajemen Galeri</h2>
        <p className="text-sm text-muted-foreground">Kelola foto kegiatan berdasarkan kategori</p>
      </div>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Kategori Album
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nama kategori baru"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <Button onClick={addCategory} variant="outline">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1 bg-accent px-3 py-1 rounded-full text-sm">
                <span>{cat.name}</span>
                <button onClick={() => deleteCategory(cat.id)} className="text-destructive hover:text-destructive/80 ml-1">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Foto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Keterangan (opsional)</Label>
              <Input
                placeholder="Keterangan foto"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload foto</p>
                  </>
                )}
              </div>
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={!uploadCategory || uploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Semua ({photos.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name} ({photos.filter((p) => p.category_id === cat.id).length})
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden shadow-md">
              <img src={photo.image_url} alt={photo.caption || ""} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="sm" onClick={() => deletePhoto(photo)}>
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-foreground/60 p-2">
                  <p className="text-background text-xs">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
