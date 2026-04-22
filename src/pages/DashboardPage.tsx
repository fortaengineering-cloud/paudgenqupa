import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BannerCarousel from "@/components/dashboard/BannerCarousel";
import { LogOut, Plus, Baby, Calendar, MapPin, User, Edit, Search, Users, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import LogoMark from "@/components/LogoMark";

interface Child {
  id: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  child_order: number;
  address: string | null;
  status: "pending" | "verified" | "rejected";
  metadata?: any; // <-- PERBAIKAN 1: Tambah tanda tanya (?) agar TypeScript tidak error
}

const statusConfig = {
  pending: { label: "Menunggu Verifikasi", variant: "secondary" as const },
  verified: { label: "Diterima / Terverifikasi", variant: "default" as const },
  rejected: { label: "Ditolak", variant: "destructive" as const },
};

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // <-- PERBAIKAN 2: Gunakan profile.id agar sinkron dengan relasi database
  useEffect(() => {
    if (profile?.id) {
      fetchChildren();
      fetchPayments();
    }
  }, [profile]);

  const fetchChildren = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", profile.id)
      .order("created_at", { ascending: true });
    if (data) setChildren(data as Child[]);
  };

  const fetchPayments = async () => {
    if (!profile?.id) return;
    
    // Coba dengan profile.id
    let { data } = await supabase
      .from("payments" as any)
      .select("*, children(full_name)")
      .eq("parent_id", profile.id)
      .order("created_at", { ascending: false });

    // Fallback ke user.id jika tidak ditemukan
    if (!data || data.length === 0) {
      const authId = user?.id;
      if (authId && authId !== profile.id) {
        const res = await supabase
          .from("payments" as any)
          .select("*, children(full_name)")
          .eq("parent_id", authId)
          .order("created_at", { ascending: false });
        if (res.data && res.data.length > 0) data = res.data;
      }
    }
    
    if (data) setPayments(data);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // FUNGSI UNTUK MENGIRIM DATA LAMA KE HALAMAN FORM (EDIT MODE)
  const handleEdit = (child: Child) => {
    localStorage.setItem('ppdbFormData', JSON.stringify(child.metadata || {}));
    localStorage.setItem('ppdbEditId', child.id);
    localStorage.setItem('ppdbFormStep', '1');
    navigate('/daftar-ppdb');
  };

  const handleRegisterSibling = () => {
    if (children.length === 0) return;
    const lastChild = children[children.length - 1];
    const m = lastChild.metadata || {};
    
    const parentData = {
      namaAyah: m.namaAyah,
      nikAyah: m.nikAyah,
      tempatLahirAyah: m.tempatLahirAyah,
      tanggalLahirAyah: m.tanggalLahirAyah,
      telpAyah: m.telpAyah,
      alamatAyah: m.alamatAyah,
      desaAyah: m.desaAyah,
      kecamatanAyah: m.kecamatanAyah,
      kabupatenAyah: m.kabupatenAyah,
      provinsiAyah: m.provinsiAyah,
      pekerjaanAyah: m.pekerjaanAyah,
      alamatKerjaAyah: m.alamatKerjaAyah,
      namaIbu: m.namaIbu,
      nikIbu: m.nikIbu,
      tempatLahirIbu: m.tempatLahirIbu,
      tanggalLahirIbu: m.tanggalLahirIbu,
      telpIbu: m.telpIbu,
      alamatIbu: m.alamatIbu,
      desaIbu: m.desaIbu,
      kecamatanIbu: m.kecamatanIbu,
      kabupatenIbu: m.kabupatenIbu,
      provinsiIbu: m.provinsiIbu,
      pekerjaanIbu: m.pekerjaanIbu,
      alamatKerjaIbu: m.alamatKerjaIbu,
      akunIg: m.akunIg,
      namaLengkap: "",
      namaPanggilan: "",
      nikAnak: "",
      jenisKelamin: "",
      tempatLahirAnak: "",
      tanggalLahirAnak: "",
      statusAnak: "",
      anakKe: "",
      jumlahSaudara: "",
      tinggalBersama: "",
      jarakSekolah: "",
      asalSekolah: "",
      kelasAsal: "",
      riwayatTilawah: "",
      jumlahHafalan: ""
    };

    localStorage.setItem('ppdbFormData', JSON.stringify(parentData));
    localStorage.removeItem('ppdbEditId');
    localStorage.setItem('ppdbFormStep', '1');
    navigate('/daftar-ppdb');
  };

  const filteredChildren = children.filter(child => 
    child.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="w-10 h-10" imageClassName="w-10 h-10" src="/logo.png" />
            <span className="font-bold text-emerald-900">PAUD GenQuPa</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Ahlan wa sahlan, <span className="font-semibold">{profile?.name || 'Bapak/Ibu'}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        <BannerCarousel />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Orang Tua</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola pendaftaran calon siswa</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {children.length === 0 ? (
              // Jika belum ada data anak sama sekali
              <Button onClick={() => {
                localStorage.removeItem('ppdbFormData');
                localStorage.removeItem('ppdbFormStep');
                localStorage.removeItem('ppdbEditId');
                navigate("/daftar-ppdb");
              }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Tambah Data Anak
              </Button>
            ) : (
              // Jika sudah ada data anak sebelumnya (Tawarkan opsi hemat waktu sebagai utama)
              <>
                <Link to="/pembayaran">
                   <Button variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 shadow-sm">
                      <Landmark className="h-4 w-4 mr-2" /> Konfirmasi Pembayaran
                   </Button>
                </Link>

                <Button onClick={handleRegisterSibling} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <Users className="h-4 w-4 mr-1" /> Daftarkan Kakak/Adik
                </Button>
                
                <Button onClick={() => {
                  localStorage.removeItem('ppdbFormData');
                  localStorage.removeItem('ppdbFormStep');
                  localStorage.removeItem('ppdbEditId');
                  navigate("/daftar-ppdb");
                }}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" /> Daftar Baru
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {children.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Cari nama anak atau status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Daftar Anak */}
        {filteredChildren.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none border-2 border-gray-200">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchQuery ? "Data tidak ditemukan" : "Belum ada data pendaftaran"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery ? "Coba kata kunci lain." : "Klik tombol di atas untuk mulai mendaftarkan anak Anda."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* RIWAYAT PEMBAYARAN - PENANGANAN PERMINTAAN USER */}
            {payments.length > 0 && (
              <Card className="border-emerald-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-emerald-50/50 py-4 border-b">
                  <CardTitle className="text-md flex items-center gap-2 text-emerald-900">
                    <Landmark className="h-4 w-4" />
                    Riwayat Konfirmasi Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/20 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">Rp {p.amount.toLocaleString()}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{p.category}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Untuk: <span className="font-semibold text-emerald-700">{p.children?.full_name || "Ananda"}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                           <span className="text-[10px] text-gray-400 font-mono">
                             {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                           </span>
                           {p.status === "pending" || !p.status ? (
                             <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] uppercase font-bold py-0.5">Menunggu</Badge>
                           ) : p.status === "verified" ? (
                             <Badge className="bg-emerald-600 text-white border-none shadow-sm text-[10px] uppercase font-bold py-0.5">Validated</Badge>
                           ) : (
                             <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5">Ditolak</Badge>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredChildren.map((child) => (
                <Card key={child.id} className="hover:shadow-md transition-all border-gray-100 overflow-hidden">
                  <div className={`h-2 w-full ${child.status === 'pending' ? 'bg-orange-400' : child.status === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <CardHeader className="pb-3 bg-white">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-gray-800">{child.full_name}</CardTitle>
                      <Badge variant={statusConfig[child.status].variant}>{statusConfig[child.status].label}</Badge>
                    </div>
                    {/* TOMBOL EDIT DATA (Hanya untuk yang statusnya pending) */}
                    {child.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(child)} className="w-fit text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 mt-1">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit Formulir
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-sm text-gray-600 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-md border border-gray-100 shadow-sm"><User className="h-4 w-4 text-emerald-600" /></div>
                    <span>{child.gender || "-"} — Anak ke-{child.child_order || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-md border border-gray-100 shadow-sm"><Calendar className="h-4 w-4 text-emerald-600" /></div>
                    <span>{child.birth_place || "-"}, {child.birth_date ? new Date(child.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
                  </div>
                  {child.address && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-white rounded-md border border-gray-100 shadow-sm"><MapPin className="h-4 w-4 text-emerald-600" /></div>
                      <span className="line-clamp-1">{child.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}