import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, FileText, Image, Megaphone, Users, ShieldCheck } from "lucide-react";
import ContentManager from "@/components/admin/ContentManager";
import GalleryManager from "@/components/admin/GalleryManager";
import BannerManager from "@/components/admin/BannerManager";
import ApplicantList from "@/components/admin/ApplicantList";

export default function AdminPage() {
  const { user, isAdminUser, loading } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-accent/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-islamic flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground">Admin</span>
              <span className="font-bold text-secondary"> GenQuPa</span>
            </div>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard Admin</h1>

        <Tabs defaultValue="applicants" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto md:inline-grid">
            <TabsTrigger value="applicants" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pendaftar</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Konten</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Galeri</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Banner</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants">
            <ApplicantList />
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
        </Tabs>
      </div>
    </div>
  );
}
