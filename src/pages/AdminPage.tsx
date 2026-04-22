import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, FileText, Image, Megaphone, Users, Home, Settings, ClipboardList, Palette, Landmark } from "lucide-react";
import ContentManager from "@/components/admin/ContentManager";
import GalleryManager from "@/components/admin/GalleryManager";
import BannerManager from "@/components/admin/BannerManager";
import ApplicantList from "@/components/admin/ApplicantList";
import AdminLogList from "@/components/admin/AdminLogList";
import AppSettings from "@/components/admin/AppSettings";
import PaymentManager from "@/components/admin/PaymentManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import LogoMark from "@/components/LogoMark";

export default function AdminPage() {
  const { user, isAdminUser, loading } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "theme-emerald");

  useEffect(() => {
    document.body.classList.remove("theme-emerald", "theme-gold", "theme-minimalist");
    document.body.classList.add(theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (!isAdminUser) {
      navigate("/");
    }
  }, [user, isAdminUser, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading || !user || !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/30 islamic-pattern">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <LogoMark className="w-10 h-10" imageClassName="w-10 h-10" src="/logo.png" />
            <div>
              <span className="font-bold text-foreground">Dashboard</span>
              <span className="font-bold text-primary"> Admin</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1.5">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Lihat Web</span>
              </Button>
            </Link>
            <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block"></div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Panel Administrasi</h1>
            <p className="text-muted-foreground">Kelola seluruh data PAUD GenQuPa</p>
          </div>
          
          <div className="flex items-center gap-3 bg-background p-2 rounded-xl border shadow-sm self-start md:self-center">
             <Palette className="h-4 w-4 text-muted-foreground ml-2" />
             <Select value={theme} onValueChange={setTheme}>
               <SelectTrigger className="w-[180px] border-0 focus:ring-0">
                 <SelectValue placeholder="Pilih Tema" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="theme-emerald">Emerald (Default)</SelectItem>
                 <SelectItem value="theme-gold">Gold (Premium)</SelectItem>
                 <SelectItem value="theme-minimalist">Minimalist White</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        <Tabs defaultValue="applicants" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto p-1 bg-background/50 backdrop-blur-sm border rounded-xl w-fit">
            <TabsTrigger value="applicants" className="gap-2 rounded-lg">
              <Users className="h-4 w-4" />
              <span>Pendaftar</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 rounded-lg">
              <Landmark className="h-4 w-4" />
              <span>Pembayaran</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-lg">
              <FileText className="h-4 w-4" />
              <span>Konten</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2 rounded-lg">
              <Image className="h-4 w-4" />
              <span>Galeri</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2 rounded-lg">
              <Megaphone className="h-4 w-4" />
              <span>Banner</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2 rounded-lg">
              <ClipboardList className="h-4 w-4" />
              <span>Log</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 rounded-lg">
              <Settings className="h-4 w-4" />
              <span>Pengaturan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants">
            <ApplicantList />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentManager />
          </TabsContent>
          <TabsContent value="content">
            <ContentManager />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>
          <TabsContent value="banners">
            <BannerManager />
          </TabsContent>
          <TabsContent value="logs">
            <AdminLogList />
          </TabsContent>
          <TabsContent value="settings">
            <AppSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
