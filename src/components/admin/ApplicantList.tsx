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
import { Search, CheckCircle, XCircle, Clock, Users, Download, MessageSquare, Trash2, Edit } from "lucide-react";
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

  // STATE UNTUK MODAL EDIT
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editData, setEditData] = useState<any>({});

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

  const handleDelete = async (applicant: Applicant) => {
    if (!window.confirm(`Yakin ingin MENGHAPUS PERMANEN data Ananda ${applicant.full_name} beserta seluruh dokumen yang diupload? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    toast({ title: "Menghapus data...", description: "Sedang membersihkan file dari server." });

    try {
      const filesToDelete: string[] = [];
      if (applicant.metadata) {
        const fileKeys = ['foto', 'kk', 'akte', 'ktp_ayah', 'ktp_ibu'];
        fileKeys.forEach(key => {
          const fileUrl = applicant.metadata[key];
          if (fileUrl && typeof fileUrl === 'string' && fileUrl.includes('/dokumen-ppdb/')) {
            const path = fileUrl.split('/dokumen-ppdb/')[1];
            if (path) filesToDelete.push(path);
          }
        });
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage.from('dokumen-ppdb').remove(filesToDelete);
        if (storageError) console.error("Error hapus file:", storageError);
      }

      await supabase.from('payments' as any).delete().eq('child_id', applicant.id);

      const { error: dbError } = await supabase.from('children').delete().eq('id', applicant.id);
      if (dbError) throw dbError;

      toast({ title: "Sapu Bersih Berhasil!", description: `Data dan dokumen ${applicant.full_name} telah dihapus permanen.` });
      logActivity('Hapus Pendaftar', `Menghapus data pendaftar ${applicant.full_name} dan dokumennya`);
      fetchApplicants();

    } catch (error: any) {
      console.error("Delete error:", error);
      toast({ title: "Gagal Menghapus", description: error.message, variant: "destructive" });
    }
  };

  // --- FUNGSI BUKA MODAL EDIT ---
  const handleEditClick = (applicant: Applicant) => {
    setEditingId(applicant.id);
    setEditData({
      full_name: applicant.full_name || "",
      gender: applicant.gender || "",
      birth_place: applicant.birth_place || "",
      birth_date: applicant.birth_date || "",
      address: applicant.address || "",
      namaAyah: applicant.metadata?.namaAyah || "",
      telpAyah: applicant.metadata?.telpAyah || "",
      namaIbu: applicant.metadata?.namaIbu || "",
      telpIbu: applicant.metadata?.telpIbu || "",
      originalMetadata: applicant.metadata || {}
    });
    setIsEditModalOpen(true);
  };

  // --- FUNGSI SIMPAN PERUBAHAN ---
  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const updatedMetadata = {
        ...editData.originalMetadata,
        namaAyah: editData.namaAyah,
        telpAyah: editData.telpAyah,
        namaIbu: editData.namaIbu,
        telpIbu: editData.telpIbu,
      };

      const payload = {
        full_name: editData.full_name,
        gender: editData.gender,
        birth_place: editData.birth_place,
        birth_date: editData.birth_date || null,
        address: editData.address,
        metadata: updatedMetadata
      };

      const { error } = await supabase.from('children').update(payload).eq('id', editingId);

      if (error) throw error;

      toast({ title: "Berhasil Diperbarui!", description: "Data pendaftar telah berhasil diubah." });
      logActivity('Edit Pendaftar', `Mengedit data pendaftar ${editData.full_name}`);
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
                      {applicant.birth_place}, {applicant.birth_date ? new Date(applicant.birth_date).toLocaleDateString("id-ID") : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {applicant.metadata?.namaAyah || applicant.profiles?.name || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {applicant.metadata?.telpAyah || applicant.profiles?.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[applicant.status].variant}>
                        {statusConfig[applicant.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          title="Edit Data"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 w-8 p-0"
                          onClick={() => handleEditClick(applicant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

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

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          title="Hapus Peserta"
                          className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 p-0"
                          onClick={() => handleDelete(applicant)}
                        >
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

      {/* ================= MODAL EDIT DATA ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-white flex items-center justify-between">
              <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
                <Edit className="w-5 h-5" /> Edit Data Pendaftar
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Seksi Data Anak */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Identitas Anak</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Lengkap</label>
                    <input type="text" className={inputClass} value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Jenis Kelamin</label>
                    <select className={inputClass} value={editData.gender} onChange={e => setEditData({...editData, gender: e.target.value})}>
                      <option value="">Pilih...</option>
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                      <option value="Laki-laki">Laki-laki (Legacy)</option>
                      <option value="Perempuan">Perempuan (Legacy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tempat Lahir</label>
                    <input type="text" className={inputClass} value={editData.birth_place} onChange={e => setEditData({...editData, birth_place: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tanggal Lahir</label>
                    <input type="date" className={inputClass} value={editData.birth_date} onChange={e => setEditData({...editData, birth_date: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Seksi Data Orang Tua */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Identitas Orang Tua & Alamat</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Ayah</label>
                    <input type="text" className={inputClass} value={editData.namaAyah} onChange={e => setEditData({...editData, namaAyah: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">No. HP Ayah</label>
                    <input type="text" className={inputClass} value={editData.telpAyah} onChange={e => setEditData({...editData, telpAyah: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nama Ibu</label>
                    <input type="text" className={inputClass} value={editData.namaIbu} onChange={e => setEditData({...editData, namaIbu: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">No. HP Ibu</label>
                    <input type="text" className={inputClass} value={editData.telpIbu} onChange={e => setEditData({...editData, telpIbu: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Alamat Lengkap</label>
                    <textarea rows={2} className={inputClass} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}