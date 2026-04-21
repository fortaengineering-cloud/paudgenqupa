import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle2, Clock, XCircle, Landmark, ArrowLeft, LayoutDashboard } from "lucide-react";

const PAYMENT_CATEGORIES = [
  "Biaya Pendaftaran",
  "SPP Bulanan",
  "Seragam",
  "Uang Kegiatan",
  "Lain-lain"
];

export default function Payments() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [children, setChildren] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    child_id: "",
    category: "",
    amount: 0,
    description: "",
    proof_url: ""
  });
  const [displayAmount, setDisplayAmount] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && profile?.id) {
       fetchChildren(profile.id);
       fetchPayments(profile.id);
    }
  }, [profile, authLoading]);

  // LOGIKA PENCARIAN SUPER TANGGUH
  const fetchChildren = async (validUserId: string) => {
    try {
      // 1. Coba cari di kolom parent_id (Ini standar yang dipakai di DashboardPage)
      let res = await supabase.from("children" as any).select("id, full_name").eq("parent_id", validUserId);
      
      // 2. Jika error ATAU datanya kosong (0), coba cari di kolom user_id (Cadangan jika skema berbeda)
      if (res.error || !res.data || res.data.length === 0) {
        // Jika validUserId adalah profile.id, user_id biasanya adalah user.id (Auth ID)
        // Kita coba ambil dari context jika tersedia
        const authId = user?.id;
        if (authId) {
          res = await supabase.from("children" as any).select("id, full_name").eq("user_id", authId);
        }
      }

      if (res.data) setChildren(res.data);
    } catch (error) {
      console.error("Gagal mengambil data anak:", error);
    }
  };

  const fetchPayments = async (validUserId: string) => {
    try {
      let res = await supabase
        .from("payments" as any)
        .select("*, children(full_name)")
        .eq("parent_id", validUserId)
        .order("created_at", { ascending: false });
        
      if (res.error || !res.data || res.data.length === 0) {
         const authId = user?.id;
         if (authId) {
           res = await supabase
            .from("payments" as any)
            .select("*, children(full_name)")
            .eq("user_id", authId)
            .order("created_at", { ascending: false });
         }
      }
      
      if (res.data) setPayments(res.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat pembayaran:", error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rawValue = value.replace(/\D/g, "");
    
    if (!rawValue) {
      setDisplayAmount("");
      setFormData(prev => ({ ...prev, amount: 0 }));
      return;
    }

    const numberValue = parseInt(rawValue, 10);
    const formatted = new Intl.NumberFormat("id-ID").format(numberValue);
    
    setDisplayAmount(formatted);
    setFormData(prev => ({ ...prev, amount: numberValue }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pembayaran/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("dokumen-ppdb")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("dokumen-ppdb")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, proof_url: publicUrl }));
      toast({ title: "Berhasil", description: "Bukti transfer berhasil diunggah." });
    } catch (error: any) {
      toast({ title: "Gagal Unggah", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.child_id || !formData.category || !formData.amount || !formData.proof_url) {
      toast({ 
        title: "Data Belum Lengkap", 
        description: "Mohon pilih anak, kategori, isi nominal, dan unggah bukti transfer.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      // Pastikan kita menggunakan Auth ID (user.id) yang biasanya menjadi basis relasi di Supabase
      const targetParentId = user?.id;

      if (!targetParentId) {
        throw new Error("Sesi login tidak valid. Silakan login kembali.");
      }

      const { data, error } = await supabase.from("payments" as any).insert({
        parent_id: targetParentId, // Mencoba menggunakan Auth ID langsung
        child_id: formData.child_id,
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        proof_url: formData.proof_url,
        status: "pending"
      }).select();

      if (error) {
        console.error("Kesalahan Insert Pertama:", error);
        // Jika gagal dengan parent_id (mungkin kolomnya berbeda?), kita coba profile.id jika tersedia
        if (profile?.id && profile.id !== targetParentId) {
          const retryRes = await supabase.from("payments" as any).insert({
            parent_id: profile.id,
            child_id: formData.child_id,
            amount: formData.amount,
            category: formData.category,
            description: formData.description,
            proof_url: formData.proof_url,
            status: "pending"
          });
          if (retryRes.error) throw retryRes.error;
        } else {
          throw error;
        }
      }

      toast({ title: "Berhasil!", description: "Konfirmasi pembayaran telah dikirim ke admin." });
      
      setFormData({ child_id: "", category: "", amount: 0, description: "", proof_url: "" });
      setDisplayAmount("");
      setPreviewUrl(null);
      
      fetchPayments(targetParentId);
    } catch (error: any) {
      console.error("Payment Submission Error:", error);
      toast({ title: "Gagal Mengirim", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent/30 pb-12">
      {/* CUSTOM HEADER UNTUK HALAMAN SISTEM */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-emerald-50 text-emerald-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-bold text-lg text-emerald-800 hidden sm:block">Sistem PPDB GenQuPa</h2>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard Utama</span>
            <span className="sm:hidden">Dashboard</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl mt-8">
        <div className="flex flex-col gap-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-foreground">Konfirmasi Pembayaran</h1>
            <p className="text-muted-foreground mt-1">Unggah bukti transfer Anda untuk verifikasi administrasi</p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <Card className="border-emerald-100 shadow-lg">
              <CardHeader className="bg-emerald-50/50 rounded-t-xl">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  Form Pembayaran
                </CardTitle>
                <CardDescription>Pilih data anak dan jenis biaya yang dibayarkan</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="child">Untuk Siswa</Label>
                      {children.length === 0 ? (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                          Mengambil data anak... (Jika tidak muncul, pastikan Anda sudah mendaftar di Dashboard).
                        </div>
                      ) : (
                        <Select value={formData.child_id} onValueChange={(v) => setFormData({ ...formData, child_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Anak" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id}>{child.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori Biaya</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Nominal Pembayaran (Rp)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                      <Input
                        id="amount"
                        type="text"
                        placeholder="Contoh: 250.000"
                        className="pl-10 font-bold"
                        value={displayAmount}
                        onChange={handleAmountChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Keterangan (Opsional)</Label>
                    <Textarea 
                      id="desc" 
                      placeholder="Tambahkan catatan jika perlu..." 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Bukti Transfer</Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-xl p-6 bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        accept="image/*"
                        disabled={uploading}
                      />
                      {previewUrl ? (
                        <div className="relative w-full max-w-[200px] aspect-square rounded-lg overflow-hidden border shadow-sm">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="text-white h-8 w-8" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                          <p className="text-sm font-medium">Klik atau drop file bukti transfer</p>
                          <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG (Maks 2MB)</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg shadow-md transition-all hover:shadow-lg" disabled={loading || uploading}>
                    {loading ? "Mengirim Data..." : "Kirim Konfirmasi Pembayaran"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Riwayat Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                      <TableHead>Ananda</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{p.children?.full_name}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.category}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">Rp {p.amount.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          {p.status === "pending" ? (
                            <Badge variant="outline" className="text-amber-600 bg-amber-50 gap-1 border-amber-200">
                              <Clock className="h-3 w-3" /> Menunggu
                            </Badge>
                          ) : p.status === "verified" ? (
                            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 gap-1 border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Berhasil
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 bg-red-50 gap-1 border-red-200">
                              <XCircle className="h-3 w-3" /> Ditolak
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                          Belum ada riwayat pembayaran.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}