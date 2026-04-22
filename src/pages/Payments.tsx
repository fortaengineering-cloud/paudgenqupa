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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    if (!authLoading && user?.id) {
       if (profile?.id) fetchChildren(profile.id);
       fetchPayments(user.id);
    }
  }, [user, profile, authLoading]);

  const fetchChildren = async (validUserId: string) => {
    try {
      let res = await supabase.from("children" as any).select("id, full_name").eq("parent_id", validUserId);
      
      if (res.error || !res.data || res.data.length === 0) {
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
      let { data, error } = await supabase
        .from("payments" as any)
        .select("*, children(full_name)")
        .eq("parent_id", validUserId)
        .order("created_at", { ascending: false });
        
      if (!data || data.length === 0) {
         const authId = user?.id;
         if (authId && authId !== validUserId) {
           const res = await supabase
            .from("payments" as any)
            .select("*, children(full_name)")
            .eq("parent_id", authId)
            .order("created_at", { ascending: false });
           
           if (res.data && res.data.length > 0) {
             data = res.data;
           }
         }
      }
      
      if (data) setPayments(data);
    } catch (error) {
      console.error("Gagal mengambil riwayat pembayaran:", error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rawValue = value.replace(/\D/g, "");
    
    if (rawValue === "") {
      setDisplayAmount("");
      setFormData({ ...formData, amount: 0 });
      return;
    }
    
    const numericValue = parseInt(rawValue, 10);
    setFormData({ ...formData, amount: numericValue });
    setDisplayAmount(new Intl.NumberFormat("id-ID").format(numericValue));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File Terlalu Besar", description: "Maksimal ukuran file adalah 2MB", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id || 'guest'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dokumen-ppdb')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('dokumen-ppdb')
        .getPublicUrl(filePath);

      setFormData({ ...formData, proof_url: publicUrl });
      setPreviewUrl(URL.createObjectURL(file));
      toast({ title: "Berhasil!", description: "Bukti transfer berhasil diunggah." });
    } catch (error: any) {
      toast({ title: "Gagal Mengunggah", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.child_id || !formData.category || !formData.amount || !formData.proof_url) {
      toast({ title: "Data Belum Lengkap", description: "Mohon isi semua field dan unggah bukti transfer.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Ambil ID langsung dari server saat tombol diklik (Solusi Error 23503)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        throw new Error("Sesi Anda telah berakhir. Silakan muat ulang (refresh) halaman ini atau login kembali.");
      }

      const exactUserId = authUser.id;

      // 2. Proses Insert ke Database
      const { error } = await supabase
        .from("payments" as any)
        .insert({
          parent_id: exactUserId,
          child_id: formData.child_id,
          amount: formData.amount,
          category: formData.category,
          description: formData.description,
          proof_url: formData.proof_url,
          status: 'pending'
        });

      if (error) {
        if (error.message.includes('foreign key constraint')) {
           const { error: fallbackError } = await supabase.from("payments" as any).insert({
             parent_id: profile?.id,
             child_id: formData.child_id,
             amount: formData.amount,
             category: formData.category,
             description: formData.description,
             proof_url: formData.proof_url,
             status: 'pending'
           });
           if (fallbackError) throw fallbackError;
        } else {
           throw error;
        }
      }

      // 3. Persiapkan Notifikasi WA ke Admin
      const childName = children.find(c => c.id === formData.child_id)?.full_name || "Ananda";
      const waAdminMsg = `Assalamu'alaikum Admin, saya baru saja mengunggah bukti transfer untuk Ananda ${childName}. Mohon divalidasi ya. Terima kasih.`;
      const encodedWa = encodeURIComponent(waAdminMsg);
      
      // Default nomor WA Ustadz Ikhsan
      let adminPhone = "6281214177714"; 

      // (Opsional) Mencoba mengambil nomor WA dari database pengaturan jika fitur admin sudah siap
      try {
        const { data } = await supabase.from('app_settings' as any).select('wa_admin').single();
        const settings = data as any;
        if (settings && settings.wa_admin) {
          // Bersihkan karakter selain angka
          let cleanDbPhone = settings.wa_admin.replace(/\D/g, "");
          if (cleanDbPhone.startsWith("0")) cleanDbPhone = "62" + cleanDbPhone.slice(1);
          adminPhone = cleanDbPhone;
        }
      } catch (e) {
        // Abaikan jika tabel app_settings belum dibuat, tetap pakai nomor default
      }

      const waUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodedWa}`;

      toast({ 
        title: "Berhasil!", 
        description: "Konfirmasi pembayaran telah dikirim ke admin.",
        action: (
          <Button size="sm" variant="outline" className="bg-emerald-600 text-white hover:bg-emerald-700 border-none h-8" onClick={() => window.open(waUrl, "_blank")}>
            Hubungi Admin
          </Button>
        )
      });
      
      // 4. Reset Form & Refresh Riwayat
      setFormData({ child_id: "", category: "", amount: 0, description: "", proof_url: "" });
      setDisplayAmount("");
      setPreviewUrl(null);
      fetchPayments(exactUserId);

    } catch (error: any) {
      console.error("Payment Submission Error:", error);
      toast({ title: "Gagal Mengirim", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="p-0 h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl font-bold text-emerald-900">Sistem PPDB GenQuPa</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="hidden sm:flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard Utama
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="form" className="space-y-6">
          <div className="flex items-center justify-center">
            <TabsList className="bg-white border border-emerald-100 p-1 rounded-full shadow-sm w-full max-w-md h-12">
              <TabsTrigger value="form" className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300 gap-2 h-10 flex-1">
                <Upload className="h-4 w-4" />
                Form Konfirmasi
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300 gap-2 h-10 flex-1">
                <FileText className="h-4 w-4" />
                Riwayat Saya
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="form">
            <Card className="border-none shadow-xl shadow-emerald-900/5 overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white p-6">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Landmark className="h-7 w-7" />
                  Konfirmasi Pembayaran
                </CardTitle>
                <CardDescription className="text-emerald-50 text-base opacity-90 leading-relaxed">
                  Unggah bukti transfer untuk mempercepat proses verifikasi pendaftaran ananda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="child" className="text-gray-700 font-semibold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Untuk Siswa
                        </Label>
                        <Select value={formData.child_id} onValueChange={(v) => setFormData({ ...formData, child_id: v })}>
                          <SelectTrigger className="border-emerald-100 focus:ring-emerald-500 rounded-xl h-12 bg-white transition-all shadow-sm">
                            <SelectValue placeholder="Pilih Anak" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-emerald-100">
                            {children.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">
                                {c.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-gray-700 font-semibold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Kategori Pembayaran
                        </Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger className="border-emerald-100 focus:ring-emerald-500 rounded-xl h-12 bg-white transition-all shadow-sm">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-emerald-100">
                            {PAYMENT_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat} className="focus:bg-emerald-50 focus:text-emerald-900 cursor-pointer">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-gray-700 font-semibold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Nominal Pembayaran
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-700 text-lg">Rp</span>
                          <Input
                            id="amount"
                            type="text"
                            value={displayAmount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            className="pl-12 border-emerald-100 focus:ring-emerald-500 rounded-xl h-12 bg-white font-bold text-lg text-emerald-900 transition-all shadow-sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground italic px-1">Gunakan format angka saja (contoh: 200000)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-700 font-semibold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Keterangan Tambahan
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Contoh: Pembayaran SPP bulan Juli 2024"
                          className="border-emerald-100 focus:ring-emerald-500 rounded-xl min-h-[100px] bg-white transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Unggah Bukti Transfer
                      </Label>
                      <div className="relative aspect-[4/5] w-full border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center bg-emerald-50/10 hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-inner">
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4 drop-shadow-xl" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                              <p className="text-white text-sm font-medium bg-emerald-600 px-4 py-2 rounded-full shadow-lg">Ganti Foto</p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6 space-y-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                              <Upload className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-emerald-700 font-bold text-lg mb-1">Klik atau drop file bukti transfer</p>
                              <p className="text-gray-400 text-sm">Format: JPG, PNG (Maks 2MB)</p>
                            </div>
                          </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-2xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600" />
                            <p className="mt-4 font-bold text-emerald-800">Sedang Mengirim...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-7 text-xl font-bold shadow-xl shadow-emerald-500/20 rounded-2xl transition-all hover:translate-y-[-2px] active:scale-[0.98]" disabled={loading || uploading}>
                    {loading ? "Menyimpan Data..." : "Kirim Konfirmasi Pembayaran"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-none shadow-xl shadow-emerald-900/5">
              <CardHeader className="p-6 border-b">
                <CardTitle className="text-xl flex items-center gap-3">
                  <FileText className="h-6 w-6 text-emerald-600" />
                  Riwayat Pembayaran Anda
                </CardTitle>
                <CardDescription>Daftar seluruh pembayaran yang telah Anda laporkan melalui sistem.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100/50">
                      <TableHead className="w-[120px] font-bold">Tanggal</TableHead>
                      <TableHead className="font-bold">Ananda</TableHead>
                      <TableHead className="font-bold">Kategori</TableHead>
                      <TableHead className="font-bold">Nominal</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                          <Landmark className="h-12 w-12 mx-auto mb-4 opacity-10" />
                          <p className="text-lg">Belum ada riwayat pembayaran.</p>
                          <p className="text-sm">Silakan gunakan form di tab sebelah untuk melakukan konfirmasi.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                          <TableCell className="text-xs font-mono text-gray-500">
                            {new Date(p.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="font-bold text-gray-800">{p.children?.full_name || "Ananda"}</TableCell>
                          <TableCell className="text-sm font-medium">{p.category}</TableCell>
                          <TableCell className="font-bold text-emerald-700">Rp {p.amount.toLocaleString("id-ID")}</TableCell>
                          <TableCell>
                            {p.status === "pending" || !p.status ? (
                              <Badge variant="outline" className="text-amber-600 bg-amber-50 gap-1.5 border-amber-200 py-1 px-3 uppercase font-bold text-[10px]">
                                <Clock className="h-3 w-3" /> AWAITING
                              </Badge>
                            ) : p.status === "verified" ? (
                              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 gap-1.5 border-emerald-200 py-1 px-3 uppercase font-bold text-[10px]">
                                <CheckCircle2 className="h-3 w-3" /> VALIDATED
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-destructive bg-red-50 gap-1.5 border-red-200 py-1 px-3 uppercase font-bold text-[10px]">
                                <XCircle className="h-3 w-3" /> REJECTED
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}