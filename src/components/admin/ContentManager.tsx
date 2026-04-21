import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { logActivity } from "@/lib/logger";

interface SiteContent {
  id: string;
  key: string;
  title: string | null;
  content: string;
}

export default function ContentManager() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .order("key");
    if (data) setContents(data as SiteContent[]);
    setLoading(false);
  };

  const handleSave = async (item: SiteContent) => {
    setSaving(item.id);
    const { error } = await supabase
      .from("site_content")
      .update({ title: item.title, content: item.content })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      logActivity(`Perbarui Konten`, `Mengubah konten bagian ${keyLabels[item.key] || item.key}`);
      toast({ title: "Berhasil!", description: "Konten berhasil diperbarui." });
    }
    setSaving(null);
  };

  const updateField = (id: string, field: "title" | "content", value: string) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const keyLabels: Record<string, string> = {
    about: "Tentang Kami",
    vision: "Visi",
    mission: "Misi",
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Manajemen Konten</h2>
        <p className="text-sm text-muted-foreground">Edit teks yang tampil di halaman utama website</p>
      </div>

      {contents.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-lg">{keyLabels[item.key] || item.key}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={item.title || ""}
                onChange={(e) => updateField(item.id, "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea
                value={item.content}
                onChange={(e) => updateField(item.id, "content", e.target.value)}
                rows={6}
              />
            </div>
            <Button
              onClick={() => handleSave(item)}
              className="gradient-islamic border-0"
              disabled={saving === item.id}
            >
              {saving === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
