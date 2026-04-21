import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Eye, Landmark, ExternalLink, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { logActivity } from "@/lib/logger";

export default function PaymentManager() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Ambil data pembayaran secara mentah tanpa join untuk memastikan data muncul 
      // meskipun relasi database belum dikonfigurasi dengan benar di Supabase.
      const { data, error } = await supabase
        .from("payments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Fetch payments error:", error);
        toast.error("Gagal mengambil data: " + error.message);
      }
      
      if (data) {
        console.log("Payments data received:", data);
        setPayments(data);
      }
    } catch (err: any) {
      console.error("Unexpected fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "verified" | "rejected" | "pending") => {
    const { error } = await supabase
      .from("payments" as any)
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Gagal memperbarui status: " + error.message);
    } else {
      const payment = payments.find(p => p.id === id);
      const parentName = "Orang Tua";
      
      if (status === "verified") {
        toast.success(`Pembayaran Berhasil Diverifikasi`);
      } else if (status === "rejected") {
        toast.info(`Pembayaran Telah Ditolak`);
      } else {
        toast.message(`Status pembayaran dikembalikan ke antrean`);
      }

      logActivity(
        `Verifikasi Pembayaran`,
        `Mengubah status pembayaran (${payment?.category}) menjadi ${status}`
      );
      
      fetchPayments();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-foreground">Kelola Pembayaran</h2>
        <p className="text-sm text-muted-foreground">Verifikasi bukti transfer dari orang tua siswa</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50/30 border-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="text-amber-500 h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">{payments.filter(p => p.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Menunggu Verifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/30 border-emerald-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500 h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">{payments.filter(p => p.status === "verified").length}</p>
                <p className="text-xs text-muted-foreground">Total Terverifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/30 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Landmark className="text-blue-500 h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">
                  Rp {payments.filter(p => p.status === "verified").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Pemasukan Terverifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Identitas (Ortu/Siswa)</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Bukti</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs">
                        {new Date(p.created_at).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-emerald-700">SISWA: {p.child_id?.substring(0, 8)}...</p>
                          <p className="text-[10px] text-muted-foreground">ORTU: {p.parent_id?.substring(0, 8)}...</p>
                        </div>
                      </TableCell>
                    <TableCell className="font-medium text-xs">
                      {p.category}
                    </TableCell>
                    <TableCell className="font-bold whitespace-nowrap">
                      Rp {p.amount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                            <Eye className="h-3.5 w-3.5" />
                            Lihat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Bukti Transfer - ID Anak {p.child_id?.substring(0, 5)}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 border rounded-xl overflow-hidden bg-accent/20 flex items-center justify-center p-4 min-h-[300px]">
                            {p.proof_url ? (
                              <img src={p.proof_url} alt="Bukti Transfer" className="max-h-[60vh] object-contain shadow-2xl" />
                            ) : (
                              <p className="text-muted-foreground">Gambar tidak tersedia</p>
                            )}
                          </div>
                          <DialogFooter className="sm:justify-between items-center mt-4">
                            <div className="text-xs text-muted-foreground font-mono">
                              ID: {p.child_id} | {p.category}
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <a href={p.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Buka di Tab Baru
                              </a>
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      {p.status === "pending" || !p.status ? (
                        <Badge variant="outline" className="text-amber-600 bg-amber-50">Menunggu</Badge>
                      ) : p.status === "verified" ? (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">Terverifikasi</Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive bg-red-50 border-red-200">Ditolak</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5 items-center">
                        {p.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1"
                              onClick={() => updateStatus(p.id, "verified")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] uppercase font-bold">Verifikasi</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-red-100 hover:bg-red-50 hover:text-destructive h-8 gap-1"
                              onClick={() => updateStatus(p.id, "rejected")}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="text-[10px] uppercase font-bold">Tolak</span>
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-muted-foreground"
                            onClick={() => updateStatus(p.id, "pending")}
                          >
                            Ubah Status
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {loading ? (
                        "Memuat data..."
                      ) : (
                        <div className="space-y-2">
                          <p>Belum ada data pembayaran yang ditemukan.</p>
                          <p className="text-[10px]">Tips: Jika data ada di database tapi tidak muncul di sini, pastikan kebijakan RLS pada tabel 'payments' sudah diatur untuk mengizinkan Admin membaca data.</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
