import { MessageSquare } from "lucide-react";

export default function FloatingWAButton() {
  const phoneNumber = "6281214177741";
  const message = "Assalamu'alaikum, saya ingin bertanya lebih lanjut mengenai pendaftaran di PAUD GenQuPa.";
  const waUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-all group"
      aria-label="Hubungi kami di WhatsApp"
    >
      <div className="hidden group-hover:block bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg absolute right-16 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-right-4">
        Tanya Info Lebih Lanjut
      </div>
      <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
    </a>
  );
}
