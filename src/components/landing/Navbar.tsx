import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import InstallPWAButton from "@/components/InstallPWAButton";

const LOGO_URL = "https://cpjkuzfoqdzqozndampm.supabase.co/storage/v1/object/public/gallery/pwa%2Flogo.png";

const navItems = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Visi & Misi", href: "#visi-misi" },
  { label: "Program", href: "#program" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdminUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo PAUD Tunas GenQuPa"
              className="h-11 w-11 object-contain"
            />
            <div className="leading-tight">
              <span className="font-bold text-base text-foreground">PAUD Tunas</span>
              <span className="font-bold text-base text-emerald-600"> GenQuPa</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <InstallPWAButton />
            {user ? (
              <>
                <Link to={isAdminUser ? "/admin" : "/dashboard"}>
                  <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-0">Daftar Sekarang</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-emerald-900"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t bg-white">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block py-3 px-4 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-4 px-4 pt-4 border-t">
              {user ? (
                <>
                  <Link to={isAdminUser ? "/admin" : "/dashboard"} className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-emerald-600">Dashboard</Button>
                  </Link>
                  <Button variant="outline" className="w-full border-red-200 text-red-600" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700">Masuk</Button>
                  </Link>
                  <Link to="/register" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-emerald-600">Daftar Sekarang</Button>
                  </Link>
                </>
              )}
              <div className="mt-2 flex justify-center">
                <InstallPWAButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
