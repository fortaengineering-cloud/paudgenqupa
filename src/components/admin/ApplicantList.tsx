import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, Clock, Users, Download, MessageSquare } from "lucide-react";
import { logActivity } from "@/lib/logger";

interface Applicant {
  id: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  child_order: number;
  address: string | null;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  profiles: {
    name: string;
    phone: string;
    address: string | null;
  } | null;
  metadata?: any;
}

const statusConfig = {
  pending: { label: "Menunggu", variant: "secondary" as const, icon: Clock },
  verified: { label: "Terverifikasi", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Ditolak", variant: "destructive" as const, icon: XCircle },
};

const DEFAULT_SETTINGS = {
  bank_info: "BSI - 7149021832 a.n Yayasan Generasi Qurani Pandeglang",
  wa_template_tagihan: "Assalamu'alaikum Ayah/Bunda [NAMA_ORTU], ✨\n\nAlhamdulillah, pendaftaran online ananda [NAMA_ANAK] telah berhasil masuk ke sistem PPDB PAUD Tunas GenQuPa. 🏫\n\nInformasi pembayaran biaya pendaftaran pendaftaran:\n💳 [BANK_INFO]\n\nMohon konfirmasi dengan mengunggah bukti transfer di aplikasi. Terima kasih! 🧾✅",
  wa_template_penerimaan: "Assalamu'alaikum Ayah/Bunda [NAMA_ORTU], ✨\n\nAlhamdulillah, ananda [NAMA_ANAK] dinyatakan LULUS dalam seleksi penerimaan siswa baru PAUD GenQuPa. 🏫🎊\n\nSilakan datang ke sekolah untuk proses daftar ulang. Selamat! 📱🤩",
};

export default function ApplicantList() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const sendWAMessage = (applicant: any, type: "tagihan" | "penerimaan") => {
    const saved = localStorage.getItem("appSettings");
    const settings = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    
    let rawPhone = applicant.profiles?.phone || applicant.metadata?.telpAyah || applicant.metadata?.telpIbu || "";
    if (!rawPhone) {
      toast({ title: "Gagal", description: "Nomor WhatsApp tidak ditemukan.", variant: "destructive" });
      return;
    }

    // Format phone: replace leading 0 with 62
    let formattedPhone = rawPhone.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("62")) {
      formattedPhone = "62" + formattedPhone;
    }

    const template = type === "tagihan" ? settings.wa_template_tagihan : settings.wa_template_penerimaan;
    
    const ayah = applicant.metadata?.namaAyah || "";
    const ibu = applicant.metadata?.namaIbu || "";
    let parentNameCombined = "";
    
    if (ayah && ibu) {
      parentNameCombined = `Ayah/Bunda ${ayah} / ${ibu}`;
    } else if (ayah || ibu) {
      parentNameCombined = `Ayah/Bunda ${ayah || ibu}`;
    } else {
      parentNameCombined = `Ayah/Bunda ${applicant.profiles?.name || "Orang Tua"}`;
    }
    
    const message = template
      .replace(/\[NAMA_ORTU\]/g, parentNameCombined)
      .replace(/\[NAMA_AYAH\]/g, ayah || "Ayah")
      .replace(/\[NAMA_IBU\]/g, ibu || "Bunda")
      .replace(/\[NAMA_ANAK\]/g, applicant.full_name)
      .replace(/\[BANK_INFO\]/g, settings.bank_info);

    // Gunakan api.whatsapp.com untuk kompatibilitas icon/emoji yang lebih baik di berbagai perangkat
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
    logActivity(
      `Kirim WhatsApp`,
      `Mengirim pesan ${type} ke ${parentNameCombined} (${applicant.full_name})`
    );
  };

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from("children")
      .select("*, profiles!children_parent_id_fkey(name, phone, address)")
      .order("created_at", { ascending: false });

    if (data) setApplicants(data as unknown as Applicant[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "verified" | "rejected") => {
    const { error } = await supabase
      .from("children")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      const applicant = applicants.find(a => a.id === id);
      logActivity(
        `Verifikasi Pendaftar`,
        `Mengubah status ${applicant?.full_name || 'Siswa'} menjadi ${statusConfig[status].label}`
      );
      fetchApplicants();
      toast({ title: "Berhasil!", description: `Status diubah menjadi ${statusConfig[status].label}.` });
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nama Anak", "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir", "Anak Ke", "Status Pendaftaran",
      "Nama Ayah", "NIK Ayah", "No Telp Ayah", "Pekerjaan Ayah",
      "Nama Ibu", "NIK Ibu", "No Telp Ibu", "Pekerjaan Ibu",
      "Alamat", "Asal Sekolah", "Riwayat Tilawah"
    ];

    const rows = filtered.map(app => {
      const m = app.metadata || {};
      const data = [
        app.full_name, app.gender, app.birth_place, app.birth_date, app.child_order, app.status,
        m.namaAyah || "", m.nikAyah || "", m.telpAyah || "", m.pekerjaanAyah || "",
        m.namaIbu || "", m.nikIbu || "", m.telpIbu || "", m.pekerjaanIbu || "",
        app.address || "", m.asalSekolah || "", m.riwayatTilawah || ""
      ];
      return data.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_PPDB_GenQuPa_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = applicants.filter((a) => {
    const matchSearch = search
      ? a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        a.profiles?.name.toLowerCase().includes(search.toLowerCase()) ||
        a.profiles?.phone.includes(search)
      : true;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    verified: applicants.filter((a) => a.status === "verified").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Daftar Pendaftar</h2>
        <p className="text-sm text-muted-foreground">Kelola dan verifikasi pendaftaran siswa baru</p>
      </div>
      <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
        <Download className="h-4 w-4" />
        📥 Export CSV
      </Button>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.pending}</p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.verified}</p>
              <p className="text-xs text-muted-foreground">Terverifikasi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.rejected}</p>
              <p className="text-xs text-muted-foreground">Ditolak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama anak atau orang tua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Anak</TableHead>
                  <TableHead className="hidden md:table-cell">TTL</TableHead>
                  <TableHead className="hidden sm:table-cell">Orang Tua</TableHead>
                  <TableHead className="hidden lg:table-cell">No. HP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{applicant.full_name}</p>
                        <p className="text-xs text-muted-foreground">{applicant.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {applicant.birth_place}, {new Date(applicant.birth_date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {applicant.profiles?.name || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {applicant.profiles?.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[applicant.status].variant}>
                        {statusConfig[applicant.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {applicant.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Verifikasi"
                              className="text-primary border-primary/30 hover:bg-primary/10 h-8 w-8 p-0"
                              onClick={() => updateStatus(applicant.id, "verified")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Tolak"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 w-8 p-0"
                              onClick={() => updateStatus(applicant.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {/* WA Buttons */}
                        <Button
                          size="sm"
                          variant="outline"
                          title="Kirim Tagihan WA"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2 gap-1"
                          onClick={() => sendWAMessage(applicant, "tagihan")}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold hidden xl:inline">Tagihan</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          title="Kirim Kelulusan WA"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 px-2 gap-1"
                          onClick={() => sendWAMessage(applicant, "penerimaan")}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold hidden xl:inline">Lulus</span>
                        </Button>

                        {applicant.status !== "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs"
                            onClick={() => updateStatus(applicant.id, applicant.status === "verified" ? "rejected" : "verified")}
                          >
                            Ubah
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {loading ? "Memuat data..." : "Belum ada pendaftar."}
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
