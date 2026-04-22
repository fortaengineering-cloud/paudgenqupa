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
import { Search, CheckCircle, XCircle, Clock, Users, Download, MessageSquare, Trash2, Edit, ExternalLink, FileText } from "lucide-react";
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

  // STATE UNTUK MODAL EDIT LENGKAP
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchApplicants();
  }, []);

  const formatPhoneForWA = (phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
    if (!cleaned.startsWith("62")) return "62" + cleaned;
    return cleaned;
  };

  const sendWAMessage = (applicant: any, type: "tagihan" | "penerimaan") => {
    const saved = localStorage.getItem("appSettings");
    const settings = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    
    let rawPhone = applicant.profiles?.phone || applicant.metadata?.telpAyah || applicant.metadata?.telpIbu || "";
    if (!rawPhone) {
      toast({ title: "Gagal", description: "Nomor WhatsApp tidak ditemukan.", variant: "destructive" });
      return;
    }

    const formattedPhone = formatPhoneForWA(rawPhone);
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

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
    logActivity(`Kirim WhatsApp`, `Mengirim pesan ${type} ke ${parentNameCombined}`);
  };

  const fetchApplicants = async () => {
    const { data, error } = await supabase
      .from("children" as any)
      .select("*, profiles!children_parent_id_fkey(name, phone, address)")
      .order("created_at", { ascending: false });

    if (data) setApplicants(data as unknown as Applicant[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "verified" | "rejected") => {
    const { error } = await supabase
      .from("children" as any)
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } else {
      const applicant = applicants.find(a => a.id === id);
      logActivity(`Verifikasi Pendaftar`, `Mengubah status ${applicant?.full_name} menjadi ${statusConfig[status].label}`);
      fetchApplicants();
      toast({ title: "Berhasil!", description: `Status diubah menjadi ${statusConfig[status].label}.` });
    }
  };

  const handleDelete = async (applicant: Applicant) => {
    if (!window.confirm(`Yakin ingin MENGHAPUS PERMANEN data Ananda ${applicant.full_name} beserta seluruh dokumen yang diupload? Tindakan ini tidak dapat dibatalkan.`)) return;
    toast({ title: "Menghapus data...", description: "Sedang membersihkan file dari server." });

    try {
      const filesToDelete: string[] = [];
      if (applicant.metadata) {
        ['foto', 'kk', 'akte', 'ktp_ayah', 'ktp_ibu'].forEach(key => {
          const fileUrl = applicant.metadata[key];
          if (fileUrl && typeof fileUrl === 'string' && fileUrl.includes('/dokumen-ppdb/')) {
            const path = fileUrl.split('/dokumen-ppdb/')[1];
            if (path) filesToDelete.push(path);
          }
        });
      }

      if (filesToDelete.length > 0) {
        await supabase.storage.from('dokumen-ppdb').remove(filesToDelete);
      }

      await supabase.from('payments' as any).delete().eq('child_id', applicant.id);
      const { error: dbError } = await supabase.from('children' as any).delete().eq('id', applicant.id);
      if (dbError) throw dbError;

      toast({ title: "Sapu Bersih Berhasil!", description: `Data ${applicant.full_name} dihapus.` });
      fetchApplicants();
    } catch (error: any) {
      toast({ title: "Gagal Menghapus", description: error.message, variant: "destructive" });
    }
  };

  const handleEditClick = (applicant: Applicant) => {
    setEditingId(applicant.id);
    const m = applicant.metadata || {};
    
    let safeGender = applicant.gender || "";
    if (safeGender.toLowerCase() === "laki-laki" || safeGender.toLowerCase() === "l") safeGender = "male";
    if (safeGender.toLowerCase() === "perempuan" || safeGender.toLowerCase() === "p") safeGender = "female";

    setEditData({
      full_name: applicant.full_name || "",
      gender: safeGender,
      birth_place: applicant.birth_place || "",
      birth_date: applicant.birth_date || "",
      address: applicant.address || "",
      
      namaPanggilan: m.namaPanggilan || "",
      nikAnak: m.nikAnak || "",
      kelasTujuan: m.kelasTujuan || "",
      statusAnak: m.statusAnak || "",
      anakKe: m.anakKe || "",
      jumlahSaudara: m.jumlahSaudara || "",
      tinggalBersama: m.tinggalBersama || "",
      jarakSekolah: m.jarakSekolah || "",
      asalSekolah: m.asalSekolah || "",
      kelasAsal: m.kelasAsal || "",
      riwayatTilawah: m.riwayatTilawah || "",
      jumlahHafalan: m.jumlahHafalan || "",

      namaAyah: m.namaAyah || "",
      nikAyah: m.nikAyah || "",
      telpAyah: m.telpAyah || "",
      pekerjaanAyah: m.pekerjaanAyah || "",
      alamatKerjaAyah: m.alamatKerjaAyah || "",
      
      namaIbu: m.namaIbu || "",
      nikIbu: m.nikIbu || "",
      telpIbu: m.telpIbu || "",
      pekerjaanIbu: m.pekerjaanIbu || "",
      alamatKerjaIbu: m.alamatKerjaIbu || "",
      akunIg: m.akunIg || "",

      foto: m.foto || "",
      kk: m.kk || "",
      akte: m.akte || "",
      ktp_ayah: m.ktp_ayah || "",
      ktp_ibu: m.ktp_ibu || "",
      
      originalMetadata: m
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.gender || !['male', 'female'].includes(editData.gender)) {
      toast({ title: "Perhatian", description: "Pilih Jenis Kelamin terlebih dahulu.", variant: "destructive" });
      return;
    }

    setSavingEdit(true);
    try {
      const updatedMetadata = {
        ...editData.originalMetadata,
        namaPanggilan: editData.namaPanggilan,
        nikAnak: editData.nikAnak,
        kelasTujuan: editData.kelasTujuan,
        statusAnak: editData.statusAnak,
        anakKe: editData.anakKe,
        jumlahSaudara: editData.jumlahSaudara,
        tinggalBersama: editData.tinggalBersama,
        jarakSekolah: editData.jarakSekolah,
        asalSekolah: editData.asalSekolah,
        kelasAsal: editData.kelasAsal,
        riwayatTilawah: editData.riwayatTilawah,
        jumlahHafalan: editData.jumlahHafalan,
        namaAyah: editData.namaAyah,
        nikAyah: editData.nikAyah,
        telpAyah: editData.telpAyah,
        pekerjaanAyah: editData.pekerjaanAyah,
        alamatKerjaAyah: editData.alamatKerjaAyah,
        namaIbu: editData.namaIbu,
        nikIbu: editData.nikIbu,
        telpIbu: editData.telpIbu,
        pekerjaanIbu: editData.pekerjaanIbu,
        alamatKerjaIbu: editData.alamatKerjaIbu,
        akunIg: editData.akunIg,
      };

      const payload = {
        full_name: editData.full_name,
        gender: editData.gender,
        birth_place: editData.birth_place,
        birth_date: editData.birth_date || null,
        address: editData.address,
        metadata: updatedMetadata
      };

      const { error } = await supabase.from('children' as any).update(payload).eq('id', editingId);

      if (error) throw error;
      toast({ title: "Berhasil Diperbarui!", description: "Data pendaftar telah berhasil diubah." });
      setIsEditModalOpen(false);
      fetchApplicants();
    } catch (error: any) {
      toast({ title: "Gagal Menyimpan", description: error.message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nama Anak", "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir", "Anak Ke", "Status",
      "Nama Ayah", "No Telp Ayah", "Nama Ibu", "No Telp Ibu", "Alamat"
    ];
    const rows = filtered.map(app => {
      const m = app.metadata || {};
      const data = [
        app.full_name, app.gender === 'male' ? 'Laki-laki' : 'Perempuan', app.birth_place, app.birth_date, app.child_order, app.status,
        m.namaAyah || "", m.telpAyah || "", m.namaIbu || "", m.telpIbu || "", app.address || ""
      ];
      return data.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Data_PPDB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = applicants.filter((a) => {
    const matchSearch = search
      ? a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        a.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.profiles?.phone?.includes(search)
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

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";

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
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{counts.total}</p><p className="text-xs text-muted-foreground">Total</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center"><Clock className="h-5 w-5 text-secondary" /></div><div><p className="text-2xl font-bold">{counts.pending}</p><p className="text-xs text-muted-foreground">Menunggu</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{counts.verified}</p><p className="text-xs text-muted-foreground">Terverifikasi</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-destructive" /></div><div><p className="text-2xl font-bold">{counts.rejected}</p><p className="text-xs text-muted-foreground">Ditolak</p></div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama anak atau orang tua..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table (SUDAH FIX SCROLL HORIZONTAL & KOLOM LENGKAP) */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Nama Anak</TableHead>
                  <TableHead className="whitespace-nowrap">TTL</TableHead>
                  <TableHead className="whitespace-nowrap">Orang Tua</TableHead>
                  <TableHead className="whitespace-nowrap">No. HP (WA)</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[200px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <p className="font-medium">{applicant.full_name}</p>
                        <p className="text-xs text-muted-foreground">{applicant.gender === 'male' ? 'Laki-laki' : applicant.gender === 'female' ? 'Perempuan' : applicant.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {applicant.birth_place}, {applicant.birth_date ? new Date(applicant.birth_date).toLocaleDateString("id-ID") : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {applicant.metadata?.namaAyah || applicant.profiles?.name || "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {(() => {
                        const phone = applicant.metadata?.telpAyah || applicant.profiles?.phone;
                        if (!phone) return <span className="text-muted-foreground">-</span>;
                        const waLink = `https://wa.me/${formatPhoneForWA(phone)}`;
                        return (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1 w-fit">
                            {phone} <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusConfig[applicant.status].variant}>
                        {statusConfig[applicant.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        <Button size="sm" variant="outline" title="Detail & Edit Data" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 w-8 p-0 shrink-0" onClick={() => handleEditClick(applicant)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        {applicant.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" title="Verifikasi" className="text-primary border-primary/30 hover:bg-primary/10 h-8 w-8 p-0 shrink-0" onClick={() => updateStatus(applicant.id, "verified")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" title="Tolak" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 w-8 p-0 shrink-0" onClick={() => updateStatus(applicant.id, "rejected")}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button size="sm" variant="outline" title="Kirim Tagihan WA" className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2 gap-1 shrink-0" onClick={() => sendWAMessage(applicant, "tagihan")}>
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold">Tagihan</span>
                        </Button>

                        <Button size="sm" variant="outline" title="Kirim Kelulusan WA" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 px-2 gap-1 shrink-0" onClick={() => sendWAMessage(applicant, "penerimaan")}>
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold">Lulus</span>
                        </Button>

                        <Button size="sm" variant="outline" title="Hapus Peserta" className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 p-0 shrink-0" onClick={() => handleDelete(applicant)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {/* ================= MODAL EDIT DATA & DOKUMEN ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-white flex items-center justify-between">
              <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                <Edit className="w-5 h-5" /> Detail & Edit Data Pendaftar
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Seksi Dokumen Upload */}
              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                <h4 className="font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Dokumen Lampiran (Bukti)
                </h4>
                <div className="flex flex-wrap gap-3">
                  {editData.foto ? <a href={editData.foto} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg shadow text-emerald-700 text-sm font-bold border hover:bg-emerald-100 flex items-center gap-2">Pas Foto <ExternalLink className="w-3 h-3"/></a> : <span className="text-sm text-gray-400 border px-3 py-1 rounded">Foto ❌</span>}
                  {editData.kk ? <a href={editData.kk} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg shadow text-emerald-700 text-sm font-bold border hover:bg-emerald-100 flex items-center gap-2">Kartu Keluarga <ExternalLink className="w-3 h-3"/></a> : <span className="text-sm text-gray-400 border px-3 py-1 rounded">KK ❌</span>}
                  {editData.akte ? <a href={editData.akte} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg shadow text-emerald-700 text-sm font-bold border hover:bg-emerald-100 flex items-center gap-2">Akte Lahir <ExternalLink className="w-3 h-3"/></a> : <span className="text-sm text-gray-400 border px-3 py-1 rounded">Akte ❌</span>}
                  {editData.ktp_ayah ? <a href={editData.ktp_ayah} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg shadow text-emerald-700 text-sm font-bold border hover:bg-emerald-100 flex items-center gap-2">KTP Ayah <ExternalLink className="w-3 h-3"/></a> : <span className="text-sm text-gray-400 border px-3 py-1 rounded">KTP Ayah ❌</span>}
                  {editData.ktp_ibu ? <a href={editData.ktp_ibu} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg shadow text-emerald-700 text-sm font-bold border hover:bg-emerald-100 flex items-center gap-2">KTP Ibu <ExternalLink className="w-3 h-3"/></a> : <span className="text-sm text-gray-400 border px-3 py-1 rounded">KTP Ibu ❌</span>}
                </div>
              </div>

              {/* Seksi Data Anak */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Identitas Anak</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Kelas Tujuan</label><input type="text" className={inputClass} value={editData.kelasTujuan} onChange={e => setEditData({...editData, kelasTujuan: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nama Lengkap</label><input type="text" className={inputClass} value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nama Panggilan</label><input type="text" className={inputClass} value={editData.namaPanggilan} onChange={e => setEditData({...editData, namaPanggilan: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">NIK Anak</label><input type="text" className={inputClass} value={editData.nikAnak} onChange={e => setEditData({...editData, nikAnak: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Jenis Kelamin</label><select className={inputClass} value={editData.gender} onChange={e => setEditData({...editData, gender: e.target.value})}><option value="">Pilih...</option><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tempat Lahir</label><input type="text" className={inputClass} value={editData.birth_place} onChange={e => setEditData({...editData, birth_place: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tanggal Lahir</label><input type="date" className={inputClass} value={editData.birth_date} onChange={e => setEditData({...editData, birth_date: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Status Anak</label><input type="text" className={inputClass} value={editData.statusAnak} onChange={e => setEditData({...editData, statusAnak: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Anak Ke</label><input type="number" className={inputClass} value={editData.anakKe} onChange={e => setEditData({...editData, anakKe: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Jml Saudara</label><input type="number" className={inputClass} value={editData.jumlahSaudara} onChange={e => setEditData({...editData, jumlahSaudara: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tinggal Bersama</label><input type="text" className={inputClass} value={editData.tinggalBersama} onChange={e => setEditData({...editData, tinggalBersama: e.target.value})} /></div>
                  <div><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Asal Sekolah</label><input type="text" className={inputClass} value={editData.asalSekolah} onChange={e => setEditData({...editData, asalSekolah: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Riwayat Tilawah / Mengaji</label><input type="text" className={inputClass} value={editData.riwayatTilawah} onChange={e => setEditData({...editData, riwayatTilawah: e.target.value})} /></div>
                </div>
              </div>

              {/* Seksi Data Orang Tua */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Identitas Ayah & Ibu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-3 bg-blue-50/30 p-3 rounded-lg border border-blue-50">
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Nama Ayah</label><input type="text" className={inputClass} value={editData.namaAyah} onChange={e => setEditData({...editData, namaAyah: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">NIK Ayah</label><input type="text" className={inputClass} value={editData.nikAyah} onChange={e => setEditData({...editData, nikAyah: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">No. HP Ayah</label><input type="text" className={inputClass} value={editData.telpAyah} onChange={e => setEditData({...editData, telpAyah: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Pekerjaan Ayah</label><input type="text" className={inputClass} value={editData.pekerjaanAyah} onChange={e => setEditData({...editData, pekerjaanAyah: e.target.value})} /></div>
                  </div>
                  <div className="space-y-3 bg-pink-50/30 p-3 rounded-lg border border-pink-50">
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Nama Ibu</label><input type="text" className={inputClass} value={editData.namaIbu} onChange={e => setEditData({...editData, namaIbu: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">NIK Ibu</label><input type="text" className={inputClass} value={editData.nikIbu} onChange={e => setEditData({...editData, nikIbu: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">No. HP Ibu</label><input type="text" className={inputClass} value={editData.telpIbu} onChange={e => setEditData({...editData, telpIbu: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Pekerjaan Ibu</label><input type="text" className={inputClass} value={editData.pekerjaanIbu} onChange={e => setEditData({...editData, pekerjaanIbu: e.target.value})} /></div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Alamat Lengkap (Keluarga)</label>
                    <textarea rows={2} className={inputClass} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Tutup</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}