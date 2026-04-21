import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/30 p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Branding Logo/Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-emerald-200 rounded-full animate-pulse opacity-50"></div>
          <div className="relative w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl font-black text-emerald-900/10 absolute left-1/2 -top-10 -translate-x-1/2 select-none">404</h1>
          <h2 className="text-3xl font-bold text-emerald-800">Halaman Tidak Ditemukan</h2>
          <p className="text-emerald-600/80 leading-relaxed">
            Mohon maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Silakan kembali ke beranda <span className="font-bold">PAUD Tunas GenQuPa</span>.
          </p>
        </div>

        <div className="pt-6">
          <Link to="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-full shadow-xl hover:shadow-emerald-200/50 transition-all gap-2 text-lg font-bold group">
              <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <div className="pt-12">
          <p className="text-xs text-emerald-900/40 font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} PAUD Tunas GenQuPa
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
