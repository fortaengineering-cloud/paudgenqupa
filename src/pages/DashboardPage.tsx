import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BannerCarousel from "@/components/dashboard/BannerCarousel";
import { LogOut, Plus, Baby, Calendar, MapPin, User } from "lucide-react";

interface Child {
  id: string;
  full_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  child_order: number;
  address: string | null;
  status: "pending" | "verified" | "rejected";
}

const statusConfig = {
  pending: { label: "Menunggu", variant: "secondary" as const },
  verified: { label: "Terverifikasi", variant: "default" as const },
  rejected: { label: "Ditolak", variant: "destructive" as const },
};

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchChildren();
    }
  }, [profile]);

  const fetchChildren = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", profile.id)
      .order("created_at", { ascending: true });
    if (data) setChildren(data as Child[]);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-islamic flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-foreground">PAUD GenQuPa</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Halo, {profile?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Orang Tua</h1>
            <p className="text-muted-foreground text-sm">Kelola data pendaftaran anak Anda</p>
          </div>
          {/* Tombol ini sekarang mengarah ke form 3 halaman */}
          <Button onClick={() => navigate("/daftar-ppdb")} className="gradient-islamic border-0">
            <Plus className="h-4 w-4" />
            <span className="ml-1">Tambah Anak</span>
          </Button>
        </div>

        {/* Children List */}
        {children.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Baby className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Belum ada data anak</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Klik "Tambah Anak" untuk mendaftarkan anak Anda
              </p>
              {/* Tombol ini juga mengarah ke form 3 halaman */}
              <Button onClick={() => navigate("/daftar-ppdb")} variant="outline">
                <Plus className="h-4 w-4" />
                <span className="ml-1">Tambah Anak Pertama</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{child.full_name}</CardTitle>
                    <Badge variant={statusConfig[child.status].variant}>
                      {statusConfig[child.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{child.gender} — Anak ke-{child.child_order}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{child.birth_place}, {new Date(child.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  {child.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{child.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}