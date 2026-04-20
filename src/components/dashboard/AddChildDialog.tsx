import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  onSuccess: () => void;
}

export default function AddChildDialog({ open, onOpenChange, profileId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    birth_place: "",
    birth_date: "",
    gender: "",
    child_order: "1",
    address: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("children").insert({
        parent_id: profileId,
        full_name: form.full_name,
        birth_place: form.birth_place,
        birth_date: form.birth_date,
        gender: form.gender,
        child_order: parseInt(form.child_order),
        address: form.address || null,
      });

      if (error) throw error;

      toast({ title: "Berhasil!", description: "Data anak berhasil ditambahkan." });
      setForm({ full_name: "", birth_place: "", birth_date: "", gender: "", child_order: "1", address: "" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menambah data anak.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Data Anak</DialogTitle>
          <DialogDescription>Isi data anak yang akan didaftarkan di PAUD GenQuPa</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input
              id="full_name"
              placeholder="Nama lengkap anak"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_place">Tempat Lahir</Label>
              <Input
                id="birth_place"
                placeholder="Kota/Kabupaten"
                value={form.birth_place}
                onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Tanggal Lahir</Label>
              <Input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="child_order">Anak ke-</Label>
              <Input
                id="child_order"
                type="number"
                min="1"
                value={form.child_order}
                onChange={(e) => setForm({ ...form, child_order: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              placeholder="Alamat lengkap (opsional)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="gradient-islamic border-0" disabled={loading || !form.gender}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
