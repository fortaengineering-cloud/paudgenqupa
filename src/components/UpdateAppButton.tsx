import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UpdateAppButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    
    toast({
      title: "Memperbarui Aplikasi...",
      description: "Sedang membersihkan cache untuk versi terbaru.",
    });

    try {
      // 1. Unregister all Service Workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // 2. Clear all Caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      // 3. Small delay to ensure everything is cleared, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Gagal memperbarui aplikasi:", error);
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleForceUpdate}
      disabled={isUpdating}
      className="fixed bottom-6 left-6 z-[9999] bg-white text-emerald-600 p-3.5 rounded-full shadow-2xl border border-emerald-100 hover:bg-emerald-50 hover:scale-110 transition-all group flex items-center justify-center"
      title="Perbarui Aplikasi (Paksa Cache)"
    >
      <div className="hidden group-hover:block bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded absolute left-14 whitespace-nowrap">
        Perbarui Versi
      </div>
      <RefreshCw className={`w-6 h-6 ${isUpdating ? "animate-spin" : ""}`} />
    </button>
  );
}
